// "Are you sure?" dialog used before deleting, deactivating or cancelling.
import Modal from './Modal';
import Button from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({ open, title, message, confirmText = 'Confirm', danger = true, loading, onConfirm, onCancel }: ConfirmDialogProps) => (
  <Modal open={open} title={title} onClose={onCancel} size="sm">
    <p className="text-sm text-slate-600">{message}</p>
    <div className="mt-6 flex justify-end gap-2">
      <Button variant="secondary" onClick={onCancel}>
        Cancel
      </Button>
      <Button variant={danger ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>
        {confirmText}
      </Button>
    </div>
  </Modal>
);

export default ConfirmDialog;