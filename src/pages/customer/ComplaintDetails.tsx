import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import complaintService from '../../services/complaintService';
import { getErrorMessage } from '../../services/api';
import { Complaint } from '../../types';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ComplaintThread from '../../components/common/ComplaintThread';

const ComplaintDetails = () => {
  const { id = '' } = useParams();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    complaintService
      .get(id)
      .then(setComplaint)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const reply = async (message: string) => {
    try {
      setComplaint(await complaintService.addResponse(id, message));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <Loader />;
  if (error || !complaint) return <EmptyState title="Complaint not found" message={error} />;

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/complaints" className="text-sm text-blue-800 hover:underline">← My complaints</Link>
      <h1 className="mb-4 mt-1 text-2xl font-bold text-slate-900">Complaint {complaint.complaintNumber}</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <ComplaintThread complaint={complaint} onReply={reply} />
      </div>
    </div>
  );
};

export default ComplaintDetails;