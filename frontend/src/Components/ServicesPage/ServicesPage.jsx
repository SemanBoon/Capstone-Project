import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";

const ServicesPage = () => {
    const { id } = useParams();
    const [services, setServices] = useState([]);
    const [newService, setNewService] = useState({ name: '', description: '', price: 0.0 });
    const [showForm, setShowForm] = useState(false);
    const [errorMessage, setErrorMessage] = useState("")
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
            setServices(data || []);
        }   catch (error) {
            console.error(error);
            setServices([]);
        }
    };

    const handleAddService = async () => {
        try {
            const response = await fetch(`http://localhost:5174/add-service`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...newService, serviceProviderId: id }),
            });
            if (!response.ok) {
                throw new Error('Failed to add service');
            }
            const data = await response.json();
                setServices([...services, data]);
                setNewService({ name: '', description: '', price: 0.0 });
                setShowForm(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteService = async (serviceId) => {
        try {
            await fetch(`http://localhost:5174/delete-service`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: serviceId }),
            });
            setServices(services.filter(service => service.id !== serviceId));
        } catch (error) {
          console.error(error);
        }
    };

    return (
        <div className="services-page">
            <h1>Manage Your Services</h1>
            <button onClick={() => setShowForm(!showForm)}>Add Service</button>
            {showForm && (
                <div>
                    <input
                        type="text"
                        value={newService.name}
                        onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                        placeholder="Service Name"
                    />
                    <input
                        type="text"
                        value={newService.description}
                        onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                        placeholder="Service Description"
                    />
                    <input
                        type="text"
                        value={newService.price}
                        onChange={(e) => setNewService({...newService, price: e.target.value})}
                        placeholder="Service Price"
                    />
                    <button onClick={handleAddService}>Add Service</button>
                    <button onClick={() => setShowForm(false)}>Cancel</button>
                </div>
            )}
            <ul>
                {services.map(service => (
                    <li key={service.id}>
                        {service.name} - {service.description} - ${parseFloat(service.price).toFixed(2)}
                        <button onClick={() => handleDeleteService(service.id)}>Delete</button>
                    </li>
                ))}
            </ul>
            <button onClick={() => navigate(`/provider-homepage/${id}`)}>Back to Homepage</button>
        </div>
    )};

export default ServicesPage;
