import React, { useState, useEffect } from 'react';
import {
    getAllUsers,
    getAllPackages,
    getAllGuides,
    getAllBookings,
    getAllContacts,
    getAllReviews,
    getAllOffers,
    addPackage,
    addGuide,
    createBooking,
    submitContact,
    addReview,
    addOffer
} from '../services/firestoreService';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const DataDebugger = () => {
    const [data, setData] = useState({
        users: [],
        packages: [],
        guides: [],
        bookings: [],
        contacts: [],
        reviews: [],
        offers: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [users, packages, guides, bookings, contacts, reviews, offers] = await Promise.all([
                    getAllUsers(),
                    getAllPackages(),
                    getAllGuides(),
                    getAllBookings(),
                    getAllContacts(),
                    getAllReviews(),
                    getAllOffers()
                ]);

                setData({
                    users,
                    packages,
                    guides,
                    bookings,
                    contacts,
                    reviews,
                    offers
                });
            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const seedData = async () => {
        if (!window.confirm("This will add sample data to your database. Continue?")) return;

        setLoading(true);
        try {
            // Seed Packages
            const p1 = await addPackage({
                title: "Ancient City Tour - Anuradhapura",
                description: "Explore the first capital of Sri Lanka, filled with ancient ruins and sacred stupas.",
                price: 150,
                duration: "2 Days",
                image: "https://images.unsplash.com/photo-1586716091392-4a4605963ec7",
                location: "Anuradhapura",
                rating: 4.8,
                reviewsCount: 12
            });

            // Seed Guides
            const g1 = await addGuide({
                name: "Anura Perera",
                specialty: "Cultural Heritage",
                experience: "10 Years",
                description: "Expert in ancient Sri Lankan history and archaeology.",
                image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
                languages: ["English", "Sinhala"],
                rating: 4.9
            });

            // Seed Users (Manual setDoc for users)
            await setDoc(doc(db, "users", "sample-user-id"), {
                displayName: "Sample Traveler",
                email: "traveler@example.com",
                role: "user",
                createdAt: new Date()
            });

            // Seed Bookings
            await createBooking({
                packageId: p1,
                packageName: "Ancient City Tour - Anuradhapura",
                userId: "sample-user-id",
                userName: "Sample Traveler",
                userEmail: "traveler@example.com",
                travelDate: "2024-01-20",
                guests: 2,
                totalPrice: 300,
                status: 'pending',
                paymentStatus: 'pending'
            });

            // Seed Contacts
            await submitContact({
                name: "John Smith",
                email: "john@example.com",
                subject: "Inquiry about Group Discounts",
                message: "We have a group of 15 people looking for a tour in February."
            });

            // Seed Reviews
            await addReview({
                userName: "Alice Wong",
                userEmail: "alice@example.com",
                packageId: p1,
                rating: 5,
                comment: "Absolutely breathtaking! The guide was very knowledgeable.",
                status: 'approved'
            });

            // Seed Offers
            await addOffer({
                code: "WELCOME20",
                discount: 20,
                description: "20% off for first-time travelers",
                validUntil: "2024-12-31",
                status: 'active'
            });

            alert("Sample data seeded successfully!");
            window.location.reload();
        } catch (err) {
            console.error("Error seeding data:", err);
            alert("Error seeding data: " + err.message);
            setLoading(false);
        }
    };

    if (loading) return (
        <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
            <h1>Database Inspector</h1>
            <p>Fetching data from all collections...</p>
        </div>
    );

    if (error) return (
        <div style={{ padding: '50px', textAlign: 'center', color: 'red', fontFamily: 'sans-serif' }}>
            <h1>Error</h1>
            <p>{error}</p>
        </div>
    );

    return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#f5f5f7', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ margin: 0, color: '#1d1d1f' }}>Database Inspector</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={seedData}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#0071e3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#0077ed'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#0071e3'}
                    >
                        🌱 Seed Sample Data
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {Object.entries(data).map(([collectionName, items]) => (
                    <div key={collectionName} style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                    }}>
                        <h2 style={{ textTransform: 'capitalize', marginTop: 0, display: 'flex', justifyContent: 'space-between' }}>
                            {collectionName}
                            <span style={{ fontSize: '0.6em', backgroundColor: '#eef2ff', color: '#4f46e5', padding: '4px 10px', borderRadius: '20px' }}>
                                {items.length} records
                            </span>
                        </h2>
                        <div style={{ maxHeight: '300px', overflowY: 'auto', fontSize: '13px' }}>
                            {items.length === 0 ? (
                                <p style={{ color: '#8e8e93' }}>No data found</p>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {items.slice(0, 5).map((item, idx) => (
                                        <li key={item.id || idx} style={{
                                            padding: '10px 0',
                                            borderBottom: '1px solid #f0f0f0',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-all'
                                        }}>
                                            <strong>ID: {item.id}</strong>
                                            <pre style={{ margin: '5px 0', fontSize: '11px', color: '#444' }}>
                                                {JSON.stringify(item, (key, value) => key === 'id' ? undefined : value, 2)}
                                            </pre>
                                        </li>
                                    ))}
                                    {items.length > 5 && (
                                        <li style={{ textAlign: 'center', padding: '10px', color: '#0071e3', fontWeight: 'bold' }}>
                                            + {items.length - 5} more...
                                        </li>
                                    )}
                                </ul>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '40px', fontSize: '12px', color: '#8e8e93' }}>
                <p>This page is for inspection purposes only. Remove it before production.</p>
            </div>
        </div>
    );
};

export default DataDebugger;
