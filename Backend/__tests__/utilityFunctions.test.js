const { getAvailableSlots, getRecommendedSlots, calculateUserPreferences, calculatePreferredTimeFromAppointments } = require('../utils.js');

describe('getAvailableSlots', () => {
    it('should return the correct available slots', () => {
        const schedule = {
            '2024-07-23': {
                slots: ['09:00', '09:30', '10:00', '10:30'],
                status: [0, 0, 1, 0]
            }
        };
        const serviceDuration = 1; // 1 hour
        const slotPopularity = {
            '09:00': 0.5,
            '09:30': 0.2
        };

        const result = getAvailableSlots(schedule, serviceDuration, slotPopularity);
        expect(result).toEqual([
            { date: '2024-07-23', time: '09:00', status: 0, popularity: 0.5 }
        ]);
    });
});

describe('getRecommendedSlots', () => {
    it('should return the correct recommended slots', () => {
        const slots = [
            { date: '2024-07-23', time: '09:00', status: 0, popularity: 0.5 },
            { date: '2024-07-23', time: '09:30', status: 0, popularity: 0.2 }
        ];
        const userPreferences = ['09:00'];
        const provider = {
            schedule: {
                '2024-07-23': {
                    slots: ['09:00', '09:30', '10:00', '10:30'],
                    status: [0, 0, 1, 0]
                }
            }
        };
        const currentTime = new Date('2024-07-23T08:00:00');
        const serviceDuration = 1;
        const preferredPeriod = 'morning';

        const result = getRecommendedSlots(slots, userPreferences, provider, currentTime, serviceDuration, preferredPeriod);
        expect(result.length).toBe(2);
        expect(result[0]).toHaveProperty('score');
    });
});

describe('calculateUserPreferences', () => {
    it('should return the correct user preferences', () => {
        const bookings = [
            { time: '2024-07-23T09:00:00' },
            { time: '2024-07-23T09:00:00' },
            { time: '2024-07-23T10:00:00' }
        ];
        const result = calculateUserPreferences(bookings);
        expect(result).toEqual(['09:00', '10:00']);
    });
});

describe('calculatePreferredTimeFromAppointments', () => {
    it('should return the correct preferred time period', () => {
        const appointments = [
            { time: '2024-07-23T09:00:00' },
            { time: '2024-07-23T09:30:00' },
            { time: '2024-07-23T10:00:00' },
            { time: '2024-07-23T14:00:00' },
            { time: '2024-07-23T15:00:00' }
        ];

        const result = calculatePreferredTimeFromAppointments(appointments);
        expect(result).toBe('morning');
    });
});
