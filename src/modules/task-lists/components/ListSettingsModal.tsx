
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from '@/components/ui/dialog';
import { useApiMutation } from '@/hooks/useApiMutation';
import { MemberRole, TaskList } from '../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const addMemberSchema = z.object({
    email: z.string().email(),
    role: z.enum(['editor', 'viewer'])
});

type AddMemberForm = z.infer<typeof addMemberSchema>;

interface ListSettingsModalProps {
    list: TaskList;
    children: React.ReactNode;
}

export function ListSettingsModal({ list, children }: ListSettingsModalProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<AddMemberForm>({
        resolver: zodResolver(addMemberSchema)
    });

    const addMemberMutation = useApiMutation(`/api/lists/${list.id}/members`);

    const onSubmit = async (data: AddMemberForm) => {
        await addMemberMutation.mutate(data);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{list.name} - Settings</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" {...register('email')} />
                            {errors.email && <p className="text-red-500">{errors.email.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="role">Role</Label>
                            <Select {...register('role')}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="editor">Editor</SelectItem>
                                    <SelectItem value="viewer">Viewer</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && <p className="text-red-500">{errors.role.message}</p>}
                        </div>
                        <Button type="submit">Add Member</Button>
                    </form>
                    <div className="mt-8">
                        <h3 className="font-semibold">Members</h3>
                        <ul>
                            {Object.entries(list.members).map(([userId, role]) => (
                                <li key={userId} className="flex justify-between items-center">
                                    <span>{userId}</span>
                                    <span>{role}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
