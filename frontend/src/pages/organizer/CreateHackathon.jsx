import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hackathonService } from '../../services/hackathonService';
import EventCreationWizard from '../../components/organizer/EventCreationWizard';

const CreateHackathon = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    isOnline: true,
    location: '',
    registrationDeadline: '',
    startDate: '',
    endDate: '',
    maxParticipants: 100,
    rules: [],
    prizes: ['TBD'],
    tags: [],
    settings: { teamSizeMax: 4 },
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        timeline: {
          startDate: form.startDate ? new Date(form.startDate) : undefined,
          endDate: form.endDate ? new Date(form.endDate) : undefined,
          registrationDeadline: form.registrationDeadline ? new Date(form.registrationDeadline) : undefined,
        },
      };
      await hackathonService.createHackathon(payload);
      navigate('/organizer?tab=events');
    } catch (err) {
      console.error('Create hackathon failed:', err);
      alert(err?.message || 'Failed to create hackathon');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EventCreationWizard
      isOpen={true}
      onClose={() => navigate('/organizer?tab=events')}
      onEventCreated={() => navigate('/organizer?tab=events')}
    />
  );
};

export default CreateHackathon;
