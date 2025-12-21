import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Badge, Row, Col } from 'react-bootstrap';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getBlockedDates, addBlockedDate, deleteBlockedDate, getGuideBookings } from '../../services/firestoreService';

const localizer = momentLocalizer(moment);

const GuideCalendar = () => {
    const [events, setEvents] = useState([]);
    const [guideId, setGuideId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);

    useEffect(() => {
        const gid = localStorage.getItem('guideId');
        if (gid) {
            setGuideId(gid);
            loadCalendarData(gid);
        }
    }, []);

    const loadCalendarData = async (gid) => {
        try {
            const blocked = await getBlockedDates(gid);
            const bookings = await getGuideBookings(gid);

            const blockedEvents = blocked.map(b => ({
                id: b.id,
                title: 'BLOCKED',
                start: new Date(b.date),
                end: new Date(b.date),
                allDay: true,
                type: 'blocked'
            }));

            const bookingEvents = bookings.filter(b => b.status !== 'cancelled').map(b => ({
                id: b.id,
                title: `Tour: ${b.fullName}`,
                start: new Date(b.travelDate),
                end: new Date(b.travelDate),
                allDay: true,
                type: 'booking'
            }));

            setEvents([...blockedEvents, ...bookingEvents]);
        } catch (error) {
            console.error("Error loading calendar data", error);
        }
    };

    const handleSelectSlot = ({ start }) => {
        const existingEvent = events.find(e =>
            moment(e.start).isSame(start, 'day')
        );

        if (existingEvent) {
            if (existingEvent.type === 'blocked') {
                handleDeleteBlocked(existingEvent.id);
            } else {
                alert("This date is already booked for a tour!");
            }
        } else {
            setSelectedSlot(start);
            setShowModal(true);
        }
    };

    const handleConfirmBlock = async () => {
        try {
            await addBlockedDate({
                guideId,
                date: moment(selectedSlot).format('YYYY-MM-DD'),
                reason: 'Guide manual block'
            });
            setShowModal(false);
            loadCalendarData(guideId);
            alert('Date blocked successfully!');
        } catch (error) {
            console.error("Error blocking date", error);
        }
    };

    const handleDeleteBlocked = async (id) => {
        if (window.confirm('Mark this date as available again?')) {
            try {
                await deleteBlockedDate(id);
                loadCalendarData(guideId);
            } catch (error) {
                console.error("Error unblocking date", error);
            }
        }
    };

    const eventStyleGetter = (event) => {
        let backgroundColor = '#3174ad';
        if (event.type === 'blocked') backgroundColor = '#dc3545';
        if (event.type === 'booking') backgroundColor = '#28a745';

        return {
            style: {
                backgroundColor,
                borderRadius: '5px',
                opacity: 0.8,
                color: 'white',
                border: 'none',
                display: 'block'
            }
        };
    };

    return (
        <div className="guide-calendar">
            <h2 className="fw-bold mb-4">Availability Calendar</h2>

            <div className="mb-4 d-flex gap-3">
                <Badge bg="success" className="p-2">Tour Booked (Confirmed)</Badge>
                <Badge bg="danger" className="p-2">Manual Block (Unavailable)</Badge>
                <Badge bg="primary" className="p-2">Available (Default)</Badge>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <div style={{ height: '600px' }}>
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            selectable
                            onSelectSlot={handleSelectSlot}
                            eventPropGetter={eventStyleGetter}
                            views={['month']}
                        />
                    </div>
                    <div className="mt-3 text-muted small">
                        <p>* Click on an empty date to block it.</p>
                        <p>* Click on a red "BLOCKED" event to make that date available again.</p>
                    </div>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Block Date</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to mark <strong>{selectedSlot && moment(selectedSlot).format('LL')}</strong> as unavailable?</p>
                    <p className="text-muted small">This will hide you from the customer booking options on this specific date.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleConfirmBlock}>Confirm Block</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default GuideCalendar;
