import React from "react";
import "./ScheduleModal.css";

const ScheduleModal = ({ showModal, setShowModal, handleScheduleSubmit, scheduleDate, setScheduleDate, startTime, setStartTime, endTime, setEndTime }) => {
    if (!showModal) return null;
    return (
        <div className="schedule-modal">
            <div className="schedule-modal-content">
                <span className="close" onClick={() => setShowModal(false)}>&times;</span>
                <h2>Set Up Your Schedule</h2>
                <div className="form-group">
                    <label htmlFor="scheduleDate">Date:</label>
                    <input
                        type="date"
                        id="scheduleDate"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="startTime">Start Time:</label>
                    <input
                        type="time"
                        id="startTime"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="endTime">End Time:</label>
                    <input
                        type="time"
                        id="endTime"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                    />
                </div>
                <button onClick={() => {handleScheduleSubmit(); setShowModal(false);}}>Submit</button>
            </div>
        </div>
    );
};

export default ScheduleModal;
