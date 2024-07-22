import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";

const ServicesPage = () => {
    const { id } = useParams();
    const [services, setServices] = useState([]);
    const [newService, setNewService] = useState('');
    const navigate = useNavigate();


    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await fetch(`http://localhost:5174/service-provider-services/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch services');
            }
            const data = await response.json();
            setServices(data.service || []);
        }   catch (error) {
            console.error(error);
            setServices([]);
        }
    };

    const handleAddService = async () => {
        try {
            const response = await fetch(`http://localhost:5174/update-services`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, services: [...services, newService] }),
            });
            if (!response.ok) {
                throw new Error('Failed to add service');
            }
            const data = await response.json();
            setServices([...services, newService]);
            setNewService('');
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteService = async (serviceId) => {
        try {
            await fetch(`http://localhost:5174/service-provider-services/${serviceId}`, {
                method: 'DELETE',
            });
            setServices(services.filter(service => service.id !== serviceId));
        } catch (error) {
          console.error(error);
        }
    };

    return (
        <div className="services-page">
            <h1>Manage Your Services</h1>
            <input
                type="text"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder="Add a new service"
            />
            <button onClick={handleAddService}>Add Service</button>
            <ul>
                {services.map(service => (
                    <li key={service.id}>
                        {service.name}
                        <button onClick={() => handleDeleteService(service)}>Delete</button>
                    </li>
                ))}
            </ul>
            <button onClick={() => navigate(`/provider-homepage/${id}`)}>Back to Homepage</button>
        </div>
    );
};

export default ServicesPage;
