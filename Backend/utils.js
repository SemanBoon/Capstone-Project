const getUpdatedWeights = (priority) => {
    switch (priority) {
        case 'focus_block':
            return {
                user_preferences: 0.2,
                preferred_time_of_day: 0.2,
                time_slot_popularity: 0.2,
                current_time_proximity: 0.2,
                focus_periods: 0.4, // Focus block gets the highest weight
            };
        case 'user_preferred_time':
            return {
                user_preferences: 0.2,
                preferred_time_of_day: 0.4, // User preferred time gets the highest weight
                time_slot_popularity: 0.2,
                current_time_proximity: 0.2,
                focus_periods: 0.2,
            };
        case 'popular_slots':
            return {
                user_preferences: 0.2,
                preferred_time_of_day: 0.2,
                time_slot_popularity: 0.4, // Popular slots get the highest weight
                current_time_proximity: 0.2,
                focus_periods: 0.2,
            };
        default:
            return {
                user_preferences: 0.15,
                preferred_time_of_day: 0.25,
                time_slot_popularity: 0.1,
                current_time_proximity: 0.2,
                focus_periods: 0.3,
            };
    }
};

const getAvailableSlots = (schedule, serviceDuration, slotPopularity) => {
    const availableSlots = [];
    const requiredSlots = Math.ceil(serviceDuration * 60 / 30);

    for (const date in schedule) {
        const { slots, status } = schedule[date];

        for (let i = 0; i <= slots.length - requiredSlots; i++) {
            if (status.slice(i, i + requiredSlots).every(s => s === 0)) {
                const slotTime = slots[i]
                availableSlots.push({
                    date,
                    time: slotTime,
                    status: status[i],
                    popularity: slotPopularity[slotTime] || 0
                });
            }
        }
    }
    if (availableSlots.length === 0) {
        return [];
    }
    return availableSlots;
};

const getRecommendedSlots = (slots, userPreferences, provider, currentTime, serviceDuration, preferredPeriod, weights) => {
    if (slots.length === 0) {
        return [];
    }
    return slots.map(slot => ({
        ...slot,
        score: calculateUtility(slot, userPreferences, provider, currentTime, weights, serviceDuration, preferredPeriod)
    })).sort((a, b) => b.score - a.score).slice(0, 5); // Return top 5 recommended slots
};

const calculateUserPreferences = (bookings) => {
    const timeCount = {};

    bookings.forEach(booking => {
        const slotTime = new Date(booking.time).toTimeString().slice(0, 5);
        if (timeCount[slotTime]) {
            timeCount[slotTime]++;
        } else {
            timeCount[slotTime] = 1;
        }
    });
    // Sort times by frequency
    const sortedTimes = Object.keys(timeCount).sort((a, b) => {
        const frequencyDiff = timeCount[b] - timeCount[a];
        if (frequencyDiff !== 0) {
            return frequencyDiff;
        }
        // If frequencies are equal, sort by time in ascending order
        return new Date(`1970-01-01T${a}:00Z`) - new Date(`1970-01-01T${b}:00Z`);
    });
    return sortedTimes.slice(0, 3);
};

const categorizeAppointmentTime = (time) => {
    const hour = new Date(time).getHours();
    if (hour >= 8 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 16) return 'afternoon';
    if (hour >= 16 && hour < 22) return 'evening';
    return null;
};

const calculatePreferredTimeFromAppointments = (appointments) => {
    if (appointments.length === 0) {
        return 'afternoon';
    }
    const timeCounts = { morning: 0, afternoon: 0, evening: 0 };

    appointments.forEach((appointment) => {
        const period = categorizeAppointmentTime(appointment.time);
        if (period) timeCounts[period]++;
    });

    const preferredPeriod = Object.keys(timeCounts).reduce((a, b) =>
        timeCounts[a] > timeCounts[b] ? a : b
    );
    return preferredPeriod;
};


const calculateUtility = (slot, userPreference, provider, currentTime, weights, serviceDuration, preferredPeriod) => {
    const calculateUserPrefScore = (slot, userPreferences) => {
        const slotTime = new Date(slot.time).toTimeString().slice(0, 5);
        return userPreferences.includes(slotTime) ? 1 : 0;
    }

    const calculateFocusPeriodScore = (slot, provider, serviceDuration) => {
        const dateSchedule = provider.schedule[slot.date];
        if (!dateSchedule)
            return 0;

        const slots = dateSchedule.slots;
        const status = dateSchedule.status;
        const slotIndex = slots.findIndex(s => new Date(s).toTimeString().slice(0, 5) === new Date(slot.time).toTimeString().slice(0, 5));

        if (slotIndex === -1 || status[slotIndex] !== 0)
            return 0;

        const requiredSlots = Math.ceil(serviceDuration * 60 / 30);

        for (let i = 0; i < requiredSlots; i++) {
            if (slotIndex + i >= status.length || status[slotIndex + i] !== 0) {
                return 0;
            }
        }

        const startFocusSlot = slotIndex - 1;
        const endFocusSlot = slotIndex + requiredSlots;

        // Check if there are booked slots immediately before or after the current slot
        const beforeFocus = startFocusSlot >= 0 && status[startFocusSlot] === 1;
        const afterFocus = endFocusSlot < status.length && status[endFocusSlot] === 1;

        return beforeFocus || afterFocus ? 1 : 0;
    };

    const calculatePreferredTimeScore = (slot, preferredPeriod) => {
        const hour = new Date(slot.time).getHours();
        if (preferredPeriod === 'morning' && hour >= 8 && hour < 12)
            return 1;
        if (preferredPeriod === 'afternoon' && hour >= 12 && hour < 16)
            return 1;
        if (preferredPeriod === 'evening' && hour >= 16 && hour < 22)
            return 1;
        return 0;
    };

    const calculateProximityScore = (slot, userTime) => {
        if (!userTime) return 0; // If user didn't enter a time, return 0

        const slotTime = new Date(slot.time);
        const enteredTime = new Date(userTime);

        // Extract only the time components
        const slotHours = slotTime.getHours();
        const slotMinutes = slotTime.getMinutes();
        const enteredHours = enteredTime.getHours();
        const enteredMinutes = enteredTime.getMinutes();

        // Calculate the time difference in minutes
        const slotTotalMinutes = slotHours * 60 + slotMinutes;
        const enteredTotalMinutes = enteredHours * 60 + enteredMinutes;

        const timeDiff = Math.abs(slotTotalMinutes - enteredTotalMinutes); // Difference in minutes
        const maxTimeDiff = 12 * 60; // 12 hours converted to minutes

        // Return the score based on the closeness to the desired time
        return 1 - (timeDiff / maxTimeDiff);
    };



    const calculatePopularityScore = (slot) => {
        return 1 - slot.popularity;
    };

    const userPrefScore = calculateUserPrefScore(slot, userPreference);
    const focusPeriodScore = calculateFocusPeriodScore(slot, provider, serviceDuration);
    const preferredTimeScore = calculatePreferredTimeScore(slot, preferredPeriod);
    const popularityScore = calculatePopularityScore(slot);
    const proximityScore = calculateProximityScore(slot, currentTime);

    return (
        weights.user_preferences * userPrefScore +
        weights.preferred_time_of_day * preferredTimeScore +
        weights.time_slot_popularity * popularityScore +
        weights.current_time_proximity * proximityScore +
        weights.focus_periods * focusPeriodScore
    );
};

module.exports = {calculateUtility, getAvailableSlots, getRecommendedSlots, calculateUserPreferences, calculatePreferredTimeFromAppointments, getUpdatedWeights, categorizeAppointmentTime }
