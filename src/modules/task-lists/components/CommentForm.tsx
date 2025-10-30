
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const commentSchema = z.object({
    text: z.string().min(1, 'Comment cannot be empty'),
});

type CommentForm = z.infer<typeof commentSchema>;

interface CommentFormProps {
    onSubmit: (data: CommentForm) => void;
}

export function CommentForm({ onSubmit }: CommentFormProps) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<CommentForm>({
        resolver: zodResolver(commentSchema),
    });

    const handleFormSubmit = (data: CommentForm) => {
        onSubmit(data);
        reset();
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-2">
            <Textarea {...register('text')} placeholder="Add a comment..." />
            {errors.text && <p className="text-red-500 text-sm">{errors.text.message}</p>}
            <Button type="submit">Add Comment</Button>
        </form>
    );
}
