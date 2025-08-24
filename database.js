// Database functions
const Database = {
    // Initialize the database structure if it doesn't exist
    init: function() {
        if (!localStorage.getItem('testBookings')) {
            localStorage.setItem('testBookings', JSON.stringify([]));
        }
        if (!localStorage.getItem('appointments')) {
            localStorage.setItem('appointments', JSON.stringify([]));
        }
        if (!localStorage.getItem('services')) {
            localStorage.setItem('services', JSON.stringify([]));
        }
        
        // Create initial data file if it doesn't exist
        if (!localStorage.getItem('dataInitialized')) {
            const initialData = {
                initializedAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('medieaseData', JSON.stringify(initialData));
            localStorage.setItem('dataInitialized', 'true');
        }
        
        this.updateDataFile();
    },
    
    // Update the data file with current information
    updateDataFile: function() {
        const data = this.exportData();
        data.lastUpdated = new Date().toISOString();
        localStorage.setItem('medieaseData', JSON.stringify(data));
    },
    
    // Test bookings
    addTestBooking: function(booking) {
        const bookings = JSON.parse(localStorage.getItem('testBookings'));
        booking.id = Date.now(); // Add unique ID
        booking.type = 'test';
        booking.timestamp = new Date().toISOString();
        bookings.push(booking);
        localStorage.setItem('testBookings', JSON.stringify(bookings));
        this.updateDataFile();
        return booking;
    },
    
    getTestBookings: function() {
        return JSON.parse(localStorage.getItem('testBookings'));
    },
    
    clearTestBookings: function() {
        localStorage.setItem('testBookings', JSON.stringify([]));
        this.updateDataFile();
    },
    
    // Appointments
    addAppointment: function(appointment) {
        const appointments = JSON.parse(localStorage.getItem('appointments'));
        appointment.id = Date.now(); // Add unique ID
        appointment.type = 'appointment';
        appointment.timestamp = new Date().toISOString();
        appointments.push(appointment);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        this.updateDataFile();
        return appointment;
    },
    
    getAppointments: function() {
        return JSON.parse(localStorage.getItem('appointments'));
    },
    
    clearAppointments: function() {
        localStorage.setItem('appointments', JSON.stringify([]));
        this.updateDataFile();
    },
    
    // Services
    addService: function(service) {
        const services = JSON.parse(localStorage.getItem('services'));
        service.id = Date.now(); // Add unique ID
        service.type = 'service';
        service.timestamp = new Date().toISOString();
        services.push(service);
        localStorage.setItem('services', JSON.stringify(services));
        this.updateDataFile();
        return service;
    },
    
    getServices: function() {
        return JSON.parse(localStorage.getItem('services'));
    },
    
    clearServices: function() {
        localStorage.setItem('services', JSON.stringify([]));
        this.updateDataFile();
    },
    
    // Export all data as JSON
    exportData: function() {
        return {
            testBookings: this.getTestBookings(),
            appointments: this.getAppointments(),
            services: this.getServices(),
            exportedAt: new Date().toISOString()
        };
    },
    
    // Clear all data
    clearAll: function() {
        this.clearTestBookings();
        this.clearAppointments();
        this.clearServices();
    },
    
    // Download data as JSON file
    downloadData: function() {
        const data = JSON.parse(localStorage.getItem('medieaseData'));
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'mediease-data.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        return true;
    }
};