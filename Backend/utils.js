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
    // service.duration unit is hours.
    // For 30 mins, it will be 0.5 * 60/ 30 = 1, in this case required slots is 1
    // For 2 hours, it will be 2 * 60/30 = 4, in this case required slots is 4

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
    return availableSlots;
};

const getRecommendedSlots = (slots, userPreferences, provider, currentTime, serviceDuration, preferredPeriod, weights) => {
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
    const sortedTimes = Object.keys(timeCount).sort((a, b) => timeCount[b] - timeCount[a]);

    // Assume the top 3 most booked times are preferred times
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

    //higher the proximity score, closer slot is to current time
    const calculateProximityScore = (slot, currentTime) => {
        const slotTime = new Date(slot.time);
        const currentDate = currentTime.toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
        const slotDate = slotTime.toISOString().split('T')[0]; // Slot date in YYYY-MM-DD format

        const dateDiff = (new Date(slotDate) - new Date(currentDate)) / (24 * 60 * 60 * 1000); // converts result to days
        const timeDiff = Math.abs(slotTime.getTime() - currentTime.getTime()) / (60 * 60 * 1000); // converts results to hours

        const totalTimeDiff = (Math.abs(dateDiff) * 24) + timeDiff; // Convert dateDiff to hours and add timeDiffInSameDay and combines them to get total time diff

        const maxTimeDiff = 7 * 24; // 168 (Maximum difference is 7 days (1 week) in hours)

        return 1 - (totalTimeDiff / maxTimeDiff);
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

module.exports = { getAvailableSlots, getRecommendedSlots, calculateUserPreferences, calculatePreferredTimeFromAppointments, getUpdatedWeights}
