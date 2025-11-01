
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Task } from '../types';
import { CommentsList } from './CommentsList';
import { useComments } from '../hooks/useComments';
import { AttachmentList } from './AttachmentList';
import { AttachmentForm } from './AttachmentForm';
import { useAttachments } from '../hooks/useAttachments';

const taskDetailSchema = z.object({
    description: z.string().optional(),
    dueDate: z.string().optional(),
    newComment: z.string().optional(),
});

type TaskDetailForm = z.infer<typeof taskDetailSchema>;

interface TaskDetailModalProps {
    task: Task;
    listId: string;
    isOpen: boolean;
    onClose: () => void;
    onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

export function TaskDetailModal({ task, listId, isOpen, onClose, onUpdateTask }: TaskDetailModalProps) {
    const { register, handleSubmit, reset } = useForm<TaskDetailForm>({
        resolver: zodResolver(taskDetailSchema),
        defaultValues: {
            description: task.description || '',
            dueDate: task.dueDate && !isNaN(new Date(task.dueDate).getTime()) ? new Date(task.dueDate).toISOString().split('T')[0] : '',
            newComment: '',
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
            const newDate = new Date(data.dueDate);
            if (!isNaN(newDate.getTime())) {
                updates.dueDate = newDate;
            }
        } else {
          updates.dueDate = undefined;
        }
        
        if (Object.keys(updates).length > 0) {
            onUpdateTask(task.id, updates);
        }

        if (data.newComment && data.newComment.trim() !== '') {
            addComment(data.newComment.trim());
        }

        onClose();
    };

    const handleUploadAttachment = (attachmentData: { file: FileList }) => {
        if (attachmentData.file.length > 0) {
            uploadAttachment(attachmentData.file[0]);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{task.text}</DialogTitle>
                    <DialogDescription>
                        View and edit the details of your task.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" {...register('description')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Input id="dueDate" type="date" {...register('dueDate')} />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Comments</h3>
                            <CommentsList comments={comments} />
                            <div className="space-y-2">
                                <Label htmlFor="newComment">Add Comment</Label>
                                <Textarea id="newComment" {...register('newComment')} placeholder="Add a new comment..." />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Attachments</h3>
                            <AttachmentList attachments={attachments} />
                            <AttachmentForm onSubmit={handleUploadAttachment} />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit">Save Changes</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
