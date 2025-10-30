
'use client';

import { useState, useEffect } from 'react';
import { TaskList } from '../types';
import usersData from '../../../../data/users.json'; // Carregando os usuários
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ListEditModalProps {
  list?: TaskList;
  onSave: (listData: Omit<Partial<TaskList>, 'id' | 'ownerId' | 'createdAt'>) => void;
  onClose: () => void;
  isOpen: boolean;
}

interface User {
  email: string;
  uid: string;
}

export const ListEditModal = ({ list, onSave, onClose, isOpen }: ListEditModalProps) => {
  const [name, setName] = useState(list?.name || '');
  const [description, setDescription] = useState(list?.description || '');
  const [sharedWith, setSharedWith] = useState<string[]>(list?.sharedWith || []);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    if (list) {
      setName(list.name || '');
      setDescription(list.description || '');
      setSharedWith(list.sharedWith || []);
    } else {
      setName('');
      setDescription('');
      setSharedWith([]);
    }
    const users = Object.entries(usersData).map(([email, { uid }]) => ({ email, uid }));
    setAllUsers(users);
  }, [list]);

  const handleSave = () => {
    if (name.trim()) {
      onSave({ name, description, sharedWith });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{list ? 'Edit List' : 'Create New List'}</DialogTitle>
          <DialogDescription>
            {list ? 'Edit the details of your list.' : 'Create a new list to organize your tasks.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">List Name</Label>
            <Input
              id="name"
              placeholder="e.g. My Awesome List"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="(Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Share with</Label>
            <Select onValueChange={setSharedWith} value={sharedWith}>
              <SelectTrigger>
                <SelectValue placeholder="Select users to share with" />
              </SelectTrigger>
              <SelectContent>
                {allUsers.map(user => (
                  <SelectItem key={user.uid} value={user.uid}>
                    {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim()}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
