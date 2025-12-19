import { db } from '../firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

const packages = [
    {
        title: 'Sigiriya Adventure',
        location: 'Sigiriya, Sri Lanka',
        price: 45000,
        duration: '3 Days',
        image: '/sigiriya.png',
        rating: 4.8,
        description: 'Climb the ancient rock fortress of Sigiriya, a UNESCO World Heritage site. Explore the water gardens, frescoes, and the mirror wall. This package also includes a village tour and authentic Sri Lankan lunch.',
        included: ['Transport', 'Hotel Stay', 'Breakfast & Dinner', 'Entrance Fees', 'English Speaking Guide'],
        hotels: [
            { name: 'Heritance Kandalama', type: 'Luxury 5-Star', image: '/hotel_sigiriya1.jpg', description: 'Award-winning eco hotel designed by Geoffrey Bawa' },
            { name: 'Aliya Resort and Spa', type: '4 Star Resort', image: '/hotel_sigiriya2.jpg', description: 'Contemporary hotel with stunning rock fortress views' }
        ],
        transport: 'Comfortable air-conditioned private vehicle (Car/Van) with an experienced driver-guide throughout the tour.',
        food: 'Includes daily breakfast at the hotel. One authentic village lunch (rice and curry) experience with a local family is included.',
        mapLocation: 'Sigiriya, Sri Lanka',
        gallery: ['/sigiriya.png', '/sigiriya_gallery.jpg', '/sigiriya_gallery2.jpg', '/hotel_sigiriya1.jpg', '/hotel_sigiriya2.jpg', '/yala.jpg']
    },
    {
        title: 'Ella Hill Climb',
        location: 'Ella, Sri Lanka',
        price: 35000,
        duration: '2 Days',
        image: '/ella.png',
        rating: 4.9,
        description: 'Experience the cool climate and stunning views of Ella. Hike up to Little Adam\'s Peak and visit the famous Nine Arches Bridge. Perfect for nature lovers and photographers.',
        included: ['Train Tickets', 'Homestay', 'Breakfast', 'Guided Hike'],
        hotels: [
            { name: '98 Acres Resort', type: 'Luxury Boutique', image: '/hotel_ella1.jpg', description: 'Nestled in a tea plantation with panoramic valley views' },
            { name: 'Ella Flower Garden', type: '3 Star Guesthouse', image: '/hotel_ella2.jpg', description: 'Cozy mountain retreat with authentic Sri Lankan hospitality' }
        ],
        transport: 'Scenic train journey from Kandy to Ella (observation class). Local transport in Tuk-Tuk included for sightseeing.',
        food: 'Daily breakfast with mountain views. Traditional Sri Lankan dinner at a local cafe with live music.',
        mapLocation: 'Ella, Sri Lanka',
        gallery: ['/ella.png', '/ella_gallery.jpg', '/ella_gallery2.jpg', '/hotel_ella1.jpg', '/hotel_ella2.jpg', '/knuckles.jpg']
    },
    {
        title: 'Coastal Bliss',
        location: 'Mirissa, Sri Lanka',
        price: 60000,
        duration: '4 Days',
        image: '/beach.png',
        rating: 4.7,
        description: 'Relax on the sandy beaches of Mirissa. Go whale watching, surf the waves, or just soak up the sun. Includes a mesmerizing sunset boat ride.',
        included: ['Beachfront Hotel', 'Whale Watching', 'Breakfast', 'Airport Transfer'],
        hotels: [
            { name: 'Mandara Resort', type: 'Luxury Beach Resort', image: '/hotel_mirissa1.jpg', description: 'Exclusive beachfront property with infinity pool' },
            { name: 'Paradise Beach Club', type: '3 Star Beach Hotel', image: '/hotel_mirissa2.jpg', description: 'Direct beach access with stunning ocean views' }
        ],
        transport: 'Private coastal drive in a luxury sedan with experienced chauffeur.',
        food: 'Seafood BBQ dinner on the beach included. Fresh tropical breakfast daily.',
        mapLocation: 'Mirissa, Sri Lanka',
        gallery: ['/beach.png', '/mirissa_gallery.jpg', '/mirissa_gallery2.jpg', '/hotel_mirissa1.jpg', '/hotel_mirissa2.jpg', '/galle.jpg']
    },
    {
        title: 'Cultural Triangle',
        location: 'Kandy, Sri Lanka',
        price: 55000,
        duration: '3 Days',
        image: '/kandy.jpg',
        rating: 4.6,
        description: 'Immerse yourself in the rich history of Kandy. Visit the Temple of the Tooth Relic, Royal Botanical Gardens, and witness a traditional cultural dance show.',
        included: ['Hotel Stay', 'All Entry Fees', 'Cultural Show Tickets', 'Private Transport'],
        hotels: [
            { name: 'Queens Hotel', type: 'Heritage Hotel', image: '/hotel_kandy1.jpg', description: 'Colonial-era property in the heart of Kandy' },
            { name: 'Grand Hotel', type: '4 Star', image: '/hotel_kandy2.jpg', description: 'Historic hotel with views of Kandy Lake' }
        ],
        transport: 'Air-conditioned van with professional driver for the entire group.',
        food: 'Buffet breakfast daily and one traditional Kandyan dinner with cultural performance.',
        mapLocation: 'Kandy, Sri Lanka',
        gallery: ['/kandy.jpg', '/kandy_gallery.jpg', '/kandy_gallery2.jpg', '/hotel_kandy1.jpg', '/hotel_kandy2.jpg', '/sigiriya.png']
    },
    {
        title: 'Wild Yala Safari',
        location: 'Yala, Sri Lanka',
        price: 40000,
        duration: '2 Days',
        image: '/yala.jpg',
        rating: 4.8,
        description: 'Spot leopards, elephants, and exotic birds in the wild. Experience two thrilling game drives in Yala National Park, known for having the highest density of leopards in the world.',
        included: ['Camping/Lodge', 'Safari Jeep', 'BBQ Dinner', 'Park Fees', 'Professional Guide'],
        hotels: [
            { name: 'Yala Safari Camp', type: 'Luxury Tented Camp', image: '/hotel_yala1.jpg', description: 'Glamping experience in the wilderness' },
            { name: 'Cinnamon Wild', type: 'Safari Lodge', image: '/hotel_yala2.jpg', description: 'Eco-lodge on the edge of the national park' }
        ],
        transport: 'Private 4x4 Safari Jeep with expert naturalist guide.',
        food: 'Traditional BBQ dinner under the stars. Full board included with local and international cuisine.',
        mapLocation: 'Yala National Park, Sri Lanka',
        gallery: ['/yala.jpg', '/hotel_yala1.jpg', '/hotel_yala2.jpg', '/beach.png', '/galle.jpg', '/mirissa_gallery.jpg']
    },
    {
        title: 'Historic Galle Fort',
        location: 'Galle, Sri Lanka',
        price: 30000,
        duration: '1 Day',
        image: '/galle.jpg',
        rating: 4.9,
        description: 'Explore the magnificent Dutch Fort in Galle, a UNESCO World Heritage Site. Walk through cobblestone streets, visit museums, boutique shops, and enjoy the iconic lighthouse views.',
        included: ['Transport', 'Guide', 'Entry Fees', 'Lunch'],
        hotels: [
            { name: 'Jetwing Lighthouse', type: 'Luxury Heritage', image: '/hotel_galle1.jpg', description: 'Iconic clifftop hotel designed by Geoffrey Bawa' },
            { name: 'Galle Fort Hotel', type: '4 Star Boutique', image: '/hotel_galle2.jpg', description: 'Restored mansion within the historic fort' }
        ],
        transport: 'Private air-conditioned vehicle with driver-guide.',
        food: 'Authentic Sri Lankan lunch at a colonial-era restaurant within the fort.',
        mapLocation: 'Galle Fort, Sri Lanka',
        gallery: ['/galle.jpg', '/hotel_galle1.jpg', '/hotel_galle2.jpg', '/beach.png', '/mirissa_gallery2.jpg', '/yala.jpg']
    },
    {
        title: 'Knuckles Trek',
        location: 'Matale, Sri Lanka',
        price: 50000,
        duration: '3 Days',
        image: '/knuckles.jpg',
        rating: 4.7,
        description: 'Embark on an adventurous trek through the Knuckles Mountain Range, a biodiversity hotspot. Experience remote villages, misty peaks, and pristine waterfalls.',
        included: ['Trekking Guide', 'Camping Equipment', 'All Meals', 'Transport', 'Permits'],
        hotels: [
            { name: 'Knuckles Mountain Resort', type: 'Eco Lodge', image: '/hotel_knuckles1.jpg', description: 'Sustainable retreat with mountain views' },
            { name: 'The Rangala House', type: 'Boutique Villa', image: '/hotel_knuckles2.jpg', description: 'Charming property at the base of the range' }
        ],
        transport: '4WD vehicle for mountain terrain with experienced driver.',
        food: 'Full board included with packed lunches on trek days. Traditional Sri Lankan meals.',
        mapLocation: 'Knuckles Mountain Range, Sri Lanka',
        gallery: ['/knuckles.jpg', '/hotel_knuckles1.jpg', '/hotel_knuckles2.jpg', '/ella.png', '/ella_gallery.jpg', '/kandy_gallery2.jpg']
    },
    {
        title: 'Jaffna Discovery',
        location: 'Jaffna, Sri Lanka',
        price: 65000,
        duration: '4 Days',
        image: '/jaffna.jpg',
        rating: 4.5,
        description: 'Discover the unique culture of Northern Sri Lanka. Visit the iconic Nallur Temple, Jaffna Fort, and experience the vibrant Tamil heritage, cuisine, and hospitality.',
        included: ['Flights/Transport', 'Hotel', 'All Meals', 'Cultural Guide', 'Entry Fees'],
        hotels: [
            { name: 'Jetwing Jaffna', type: '4 Star Hotel', image: '/hotel_jaffna1.jpg', description: 'Contemporary hotel in the heart of Jaffna' },
            { name: 'Tilko Jaffna City Hotel', type: '3 Star', image: '/hotel_jaffna2.jpg', description: 'Comfortable accommodation with local charm' }
        ],
        transport: 'Domestic flight to Jaffna. Private vehicle with cultural guide throughout.',
        food: 'Full board with authentic Jaffna Tamil cuisine. Special cooking demonstration included.',
        mapLocation: 'Jaffna, Sri Lanka',
        gallery: ['/jaffna.jpg', '/jaffna_gallery1.jpg', '/hotel_jaffna1.jpg', '/hotel_jaffna2.jpg', '/kandy.jpg', '/sigiriya.png']
    }
];

const guides = [
    { name: 'Saman Perera', role: 'Cultural Expert', image: 'https://randomuser.me/api/portraits/men/32.jpg', experience: '15 years', rating: 4.9, status: 'approved' },
    { name: 'Nimali Silva', role: 'Naturalist', image: 'https://randomuser.me/api/portraits/women/44.jpg', experience: '10 years', rating: 4.8, status: 'approved' },
    { name: 'Kumar Sangakkara', role: 'Adventure Lead', image: 'https://randomuser.me/api/portraits/men/22.jpg', experience: '12 years', rating: 5.0, status: 'approved' },
    { name: 'Dinesh Chandimal', role: 'Historian', image: 'https://randomuser.me/api/portraits/men/15.jpg', experience: '20 years', rating: 4.7, status: 'approved' },
    { name: 'Chathurika Fernando', role: 'Eco Guide', image: 'https://randomuser.me/api/portraits/women/65.jpg', experience: '8 years', rating: 4.9, status: 'approved' }
];

const bookings = [
    {
        bookingId: 'BK-782910',
        customerName: 'John Doe',
        customerEmail: 'john.doe@example.com',
        customerPhone: '+94 77 111 2222',
        packageTitle: 'Sigiriya Adventure',
        travelDate: '2025-01-15',
        adults: 2,
        children: 0,
        totalAmount: 90000,
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'Credit Card',
        specialRequests: 'Vegetarian meals preferred.',
        createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    },
    {
        bookingId: 'BK-893021',
        customerName: 'Sarah Williams',
        customerEmail: 'sarah.w@example.com',
        customerPhone: '+94 71 333 4444',
        packageTitle: 'Ella Hill Climb',
        travelDate: '2025-02-10',
        adults: 1,
        children: 0,
        totalAmount: 35000,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'PayPal',
        specialRequests: '',
        createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    },
    {
        bookingId: 'BK-456123',
        customerName: 'Mike Johnson',
        customerEmail: 'mike.j@example.com',
        customerPhone: '+94 72 555 6666',
        packageTitle: 'Wild Yala Safari',
        travelDate: '2025-01-20',
        adults: 3,
        children: 2,
        totalAmount: 160000, // Approx for family
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'Credit Card',
        specialRequests: 'Need a child seat in the jeep.',
        createdAt: new Date(Date.now() - 259200000).toISOString() // 3 days ago
    },
    {
        bookingId: 'BK-112233',
        customerName: 'Emma Brown',
        customerEmail: 'emma.b@example.com',
        customerPhone: '+94 70 777 8888',
        packageTitle: 'Coastal Bliss',
        travelDate: '2025-03-05',
        adults: 2,
        children: 1,
        totalAmount: 150000,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'Debit Card',
        specialRequests: 'Honeymoon couple, flower decoration if possible.',
        createdAt: new Date(Date.now() - 345600000).toISOString() // 4 days ago
    },
    {
        bookingId: 'BK-998877',
        customerName: 'David Lee',
        customerEmail: 'david.l@example.com',
        customerPhone: '+94 76 999 0000',
        packageTitle: 'Historic Galle Fort',
        travelDate: '2025-01-05',
        adults: 4,
        children: 0,
        totalAmount: 120000,
        status: 'completed',
        paymentStatus: 'paid',
        paymentMethod: 'Credit Card',
        specialRequests: '',
        createdAt: new Date(Date.now() - 604800000).toISOString() // 1 week ago
    }
];

const contacts = [
    {
        name: 'Alice Smith',
        email: 'alice@example.com',
        phone: '+94 77 123 4567',
        subject: 'Custom Tour Inquiry',
        message: 'Hi, do you offer customizable tours for large groups (approx 15 people)?',
        status: 'pending',
        createdAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
    },
    {
        name: 'Bob Jones',
        email: 'bob@example.com',
        phone: '+94 71 234 5678',
        subject: 'Guide availability',
        message: 'Is Saman Perera available for a private tour in late February?',
        status: 'resolved',
        createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    },
    {
        name: 'Charlie Davis',
        email: 'charlie@example.com',
        phone: '',
        subject: 'Visa requirements',
        message: 'What are the visa requirements for US citizens visiting Sri Lanka?',
        status: 'pending',
        createdAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
        name: 'Diana Prince',
        email: 'diana@example.com',
        phone: '+94 75 888 9999',
        subject: 'Partnership opportunity',
        message: 'We are a travel agency in UK interested in partnering with you.',
        status: 'pending',
        createdAt: new Date(Date.now() - 259200000).toISOString()
    },
    {
        name: 'Evan Wright',
        email: 'evan@example.com',
        phone: '',
        subject: 'Refund policy',
        message: 'I may need to cancel my trip due to work. What is your refund policy?',
        status: 'resolved',
        createdAt: new Date(Date.now() - 432000000).toISOString()
    }
];

const reviews = [
    {
        userName: 'Michael Brown',
        userEmail: 'michael@example.com',
        packageName: 'Ella Hill Climb',
        rating: 5,
        comment: 'Amazing experience! The views were breathtaking and the guide was super friendly.',
        status: 'approved',
        createdAt: new Date(Date.now() - 100000000).toISOString(),
        name: 'Michael Brown',
        country: 'Australia'
    },
    {
        userName: 'Jessica Chen',
        userEmail: 'jess.chen@example.com',
        packageName: 'Cultural Triangle',
        rating: 4,
        comment: 'Very informative tour. The hotels were great. Just wished we had more time at Sigiriya.',
        status: 'approved',
        createdAt: new Date(Date.now() - 200000000).toISOString(),
        name: 'Jessica Chen',
        country: 'Canada'
    },
    {
        userName: 'Ahmed Hassan',
        userEmail: 'ahmed@example.com',
        packageName: 'Wild Yala Safari',
        rating: 5,
        comment: 'Saw a leopard within the first hour! Unforgettable safari. Highly recommend.',
        status: 'pending',
        createdAt: new Date(Date.now() - 50000000).toISOString(),
        name: 'Ahmed Hassan',
        country: 'UAE'
    },
    {
        userName: 'Emily Clarke',
        userEmail: 'emily@example.com',
        packageName: 'Coastal Bliss',
        rating: 3,
        comment: 'The beach was lovely but the transfer vehicle was a bit cramped for 4 people.',
        status: 'pending',
        createdAt: new Date(Date.now() - 60000000).toISOString(),
        name: 'Emily Clarke',
        country: 'UK'
    },
    {
        userName: 'Tom Wilson',
        userEmail: 'tom@example.com',
        packageName: 'Sigiriya Adventure',
        rating: 5,
        comment: 'A perfectly organized trip. Ar One took care of everything!',
        status: 'approved',
        createdAt: new Date(Date.now() - 400000000).toISOString(),
        name: 'Tom Wilson',
        country: 'USA'
    }
];

export const seedDatabase = async () => {
    try {
        console.log("Starting database seed...");
        let results = [];

        // Seed Packages
        const packagesRef = collection(db, "packages");
        const packagesSnapshot = await getDocs(packagesRef);
        if (packagesSnapshot.empty) {
            let count = 0;
            for (const pkg of packages) {
                await addDoc(packagesRef, { ...pkg, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
                count++;
            }
            results.push(`Added ${count} packages.`);
        } else {
            results.push("Packages already exist. Skipped.");
        }

        // Seed Guides
        const guidesRef = collection(db, "guides");
        const guidesSnapshot = await getDocs(guidesRef);
        if (guidesSnapshot.empty) {
            let count = 0;
            for (const guide of guides) {
                await addDoc(guidesRef, { ...guide, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
                count++;
            }
            results.push(`Added ${count} guides.`);
        } else {
            results.push("Guides already exist. Skipped.");
        }

        // Seed Bookings
        const bookingsRef = collection(db, "bookings");
        const bookingsSnapshot = await getDocs(bookingsRef);
        if (bookingsSnapshot.empty) {
            let count = 0;
            for (const booking of bookings) {
                await addDoc(bookingsRef, { ...booking, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
                count++;
            }
            results.push(`Added ${count} bookings.`);
        } else {
            results.push("Bookings already exist. Skipped.");
        }

        // Seed Contacts
        const contactsRef = collection(db, "contacts");
        const contactsSnapshot = await getDocs(contactsRef);
        if (contactsSnapshot.empty) {
            let count = 0;
            for (const contact of contacts) {
                await addDoc(contactsRef, { ...contact, createdAt: serverTimestamp() });
                count++;
            }
            results.push(`Added ${count} contacts.`);
        } else {
            results.push("Contacts already exist. Skipped.");
        }

        // Seed Reviews
        const reviewsRef = collection(db, "reviews");
        const reviewsSnapshot = await getDocs(reviewsRef);
        if (reviewsSnapshot.empty) {
            let count = 0;
            for (const review of reviews) {
                await addDoc(reviewsRef, { ...review, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
                count++;
            }
            results.push(`Added ${count} reviews.`);
        } else {
            results.push("Reviews already exist. Skipped.");
        }

        console.log("Seeding complete:", results.join(" "));
        return { success: true, message: results.join("\n") };

    } catch (error) {
        console.error("Error seeding database:", error);
        throw error;
    }
};
