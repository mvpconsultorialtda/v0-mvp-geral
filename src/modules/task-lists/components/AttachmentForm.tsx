
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const attachmentSchema = z.object({
    file: z.instanceof(FileList).refine(files => files?.length === 1, 'Please select a file'),
});

type AttachmentForm = z.infer<typeof attachmentSchema>;

interface AttachmentFormProps {
    onSubmit: (data: AttachmentForm) => void;
}

export function AttachmentForm({ onSubmit }: AttachmentFormProps) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<AttachmentForm>({
        resolver: zodResolver(attachmentSchema),
    });

    const handleFormSubmit = (data: AttachmentForm) => {
        onSubmit(data);
        reset();
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-2">
            <Input type="file" {...register('file')} />
            {errors.file && <p className="text-red-500 text-sm">{errors.file.message}</p>}
            <Button type="submit">Upload</Button>
        </form>
    );
}
