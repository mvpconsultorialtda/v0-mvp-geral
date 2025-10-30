
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Task } from '../types';
import { CommentsList } from './CommentsList';
import { CommentForm } from './CommentForm';
import { useComments } from '../hooks/useComments';
import { AttachmentList } from './AttachmentList';
import { AttachmentForm } from './AttachmentForm';
import { useAttachments } from '../hooks/useAttachments';

const taskDetailSchema = z.object({
    description: z.string().optional(),
    dueDate: z.string().optional(), // Changed to string to accept input value
});

type TaskDetailForm = z.infer<typeof taskDetailSchema>;

interface TaskDetailModalProps {
    task: Task;
    listId: string;
    isOpen: boolean;
    onClose: () => void;
    onUpdateTask: (taskId: string, listId: string, updates: Partial<Task>) => void;
}

export function TaskDetailModal({ task, listId, isOpen, onClose, onUpdateTask }: TaskDetailModalProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<TaskDetailForm>({
        resolver: zodResolver(taskDetailSchema),
        defaultValues: {
            description: task.description || '',
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        }
    });
    const { comments, addComment } = useComments(listId, task.id);
    const { attachments, uploadAttachment } = useAttachments(listId, task.id);

    const onSubmit = (data: TaskDetailForm) => {
        const updates: Partial<Task> = {};
        if (data.description !== undefined) {
            updates.description = data.description;
        }
        if (data.dueDate) {
            updates.dueDate = new Date(data.dueDate);
        }
        onUpdateTask(task.id, listId, updates);
        onClose();
    };

    const handleAddComment = (commentData: { text: string }) => {
        addComment(commentData.text);
    };

    const handleUploadAttachment = (attachmentData: { file: FileList }) => {
        if (attachmentData.file.length > 0) {
            uploadAttachment(attachmentData.file[0]);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{task.text}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" {...register('description')} />
                        </div>
                        <div>
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Input id="dueDate" type="date" {...register('dueDate')} />
                        </div>
                        <Button type="submit">Save</Button>
                    </form>
                    <div className="space-y-4">
                        <CommentsList comments={comments} />
                        <CommentForm onSubmit={handleAddComment} />
                    </div>
                    <div className="space-y-4">
                        <AttachmentList attachments={attachments} />
                        <AttachmentForm onSubmit={handleUploadAttachment} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
