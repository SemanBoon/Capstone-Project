const { getAvailableSlots, calculateUserPreferences, calculatePreferredTimeFromAppointments, getRecommendedSlots, getUpdatedWeights } = require('../utils.js');

describe('getAvailableSlots', () => {
    const mockSchedule = {
        '2023-07-23': {
            slots: ['08:00', '08:30', '09:00', '09:30', '10:00'],
            status: [0, 1, 0, 0, 0], // '08:30 - 9:00' slot is booked
        },
    };
    const serviceDuration = 1; // 1 hour

    test('should return available slots correctly', () => {
        const availableSlots = getAvailableSlots(mockSchedule, serviceDuration, {});
        expect(availableSlots).toEqual([
            { date: '2023-07-23', time: '09:00', status: 0, popularity: 0 },
            { date: '2023-07-23', time: '09:30', status: 0, popularity: 0 },
        ]);
    });

    test('should return empty array if no slots available', () => {
        const mockSchedule = {
            '2023-07-23': {
                slots: ['08:00', '08:30'],
                status: [1, 1], // All slots booked
            },
        };
        const availableSlots = getAvailableSlots(mockSchedule, serviceDuration, {});
        expect(availableSlots).toEqual([]);
    });

    test('should handle edge case of partial slot booking', () => {
        const mockSchedule = {
            '2023-07-23': {
                slots: ['08:00', '08:30', '09:00', '09:30'],
                status: [0, 1, 0, 1], // Mixed booked and available
            },
        };
        const availableSlots = getAvailableSlots(mockSchedule, serviceDuration, {});
        expect(availableSlots).toEqual([]);
    });
});

describe('calculateUserPreferences', () => {
    test('should correctly identify user preferred times', () => {
        const bookings = [
            { time: '2024-07-30T09:00:00' },
            { time: '2024-07-30T09:30:00' },
            { time: '2024-07-30T09:30:00' },
            { time: '2024-07-30T10:00:00' },
            { time: '2024-07-30T10:30:00' },
            { time: '2024-07-30T08:00:00' },
        ];
        const userPreferences = calculateUserPreferences(bookings);
        expect(userPreferences).toEqual([ '09:30', '08:00', '09:00']);
    });

    test('should return empty array for no bookings', () => {
        const userPreferences = calculateUserPreferences([]);
        expect(userPreferences).toEqual([]);
    });
});

describe('calculatePreferredTimeFromAppointments', () => {
    test('should correctly identify the most booked period', () => {
        const appointments = [
            { time: '2024-07-23T08:00:00Z' },
            { time: '2024-07-23T09:00:00Z' },
            { time: '2024-07-23T10:00:00Z' },
            { time: '2024-07-23T14:00:00Z' },
            { time: '2024-07-23T15:00:00Z' },
        ];
        const preferredPeriod = calculatePreferredTimeFromAppointments(appointments);
        expect(preferredPeriod).toEqual('morning');
    });

    test('should return "morning" for no appointments', () => {
      const preferredPeriod = calculatePreferredTimeFromAppointments([]);
      expect(preferredPeriod).toEqual('afternoon');
    });
});


describe('getRecommendedSlots', () => {
    it('should return the top 5 recommended slots based on the given criteria', () => {
        const slots = [
            { date: '2021-09-01', time: '09:00', popularity: 0.1 },
            { date: '2021-09-01', time: '10:00', popularity: 0.2 },
            { date: '2021-09-01', time: '11:00', popularity: 0.3 },
            { date: '2021-09-01', time: '12:00', popularity: 0.4 },
            { date: '2021-09-01', time: '13:00', popularity: 0.5 },
            { date: '2021-09-01', time: '14:00', popularity: 0.6 }
        ];
        const userPreferences = ['09:00', '12:00', '15:00'];
        const provider = { schedule: { '2021-09-01': { slots: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00'], status: [0, 0, 0, 0, 0, 0] } } };
        const currentTime = new Date('2021-09-01T08:00:00');
        const serviceDuration = 60;
        const preferredPeriod = 'morning';
        const weights = {
            user_preferences: 0.2,
            preferred_time_of_day: 0.2,
            time_slot_popularity: 0.2,
            current_time_proximity: 0.2,
            focus_periods: 0.2
        };

        const recommendedSlots = getRecommendedSlots(slots, userPreferences, provider, currentTime, serviceDuration, preferredPeriod, weights);
        expect(recommendedSlots.length).toBe(5);
        expect(recommendedSlots[0].time).toBe('09:00'); // Assuming the highest score should be at 9 AM
    });

    it('should handle empty slots array', () => {
        const slots = [];
        const userPreferences = ['09:00', '12:00', '15:00'];
        const provider = { schedule: { '2021-09-01': { slots: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00'], status: [1, 1, 1, 1, 1, 1] } } };
        const currentTime = new Date('2021-09-01T08:00:00');
        const serviceDuration = 2;
        const preferredPeriod = 'morning';
        const weights = getUpdatedWeights('popular_slots');

        const recommendedSlots = getRecommendedSlots(slots, userPreferences, provider, currentTime, serviceDuration, preferredPeriod, weights);
        expect(recommendedSlots).toEqual([]);
    });

    it('should calculate higher score for slots closer to user-entered time', () => {
        const slots = [
            { date: '2021-09-01', time: '09:00', popularity: 0.1 },
            { date: '2021-09-01', time: '14:00', popularity: 0.2 }
        ];
        const userPreferences = ['09:00', '12:00', '15:00'];
        const provider = { schedule: { '2021-09-01': { slots: ['09:00', '14:00'], status: [0, 0] } } };
        const currentTime = new Date('2021-09-01T08:00:00');
        const serviceDuration = 60;
        const preferredPeriod = 'morning';
        const weights = {
            user_preferences: 0.2,
            preferred_time_of_day: 0.2,
            time_slot_popularity: 0.2,
            current_time_proximity: 0.2,
            focus_periods: 0.2
        };

        const recommendedSlots = getRecommendedSlots(slots, userPreferences, provider, currentTime, serviceDuration, preferredPeriod, weights);
        expect(recommendedSlots[0].time).toBe('09:00'); // Closer to user-entered time
    });

    it('should assign score of 0 for user preferences when none match', () => {
        const slots = [
            { date: '2021-09-01', time: '13:00', popularity: 0.1 },
            { date: '2021-09-01', time: '14:00', popularity: 0.2 }
        ];
        const userPreferences = ['09:00', '12:00', '15:00'];
        const provider = { schedule: { '2021-09-01': { slots: ['13:00', '14:00'], status: [0, 0] } } };
        const currentTime = new Date('2021-09-01T08:00:00');
        const serviceDuration = 60;
        const preferredPeriod = 'morning';
        const weights = {
            user_preferences: 0.2,
            preferred_time_of_day: 0.2,
            time_slot_popularity: 0.2,
            current_time_proximity: 0.2,
            focus_periods: 0.2
        };

        const recommendedSlots = getRecommendedSlots(slots, userPreferences, provider, currentTime, serviceDuration, preferredPeriod, weights);
        expect(recommendedSlots.every(slot => slot.score === 0)).toBe(false);
    });

});
