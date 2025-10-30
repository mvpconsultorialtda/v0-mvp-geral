
import { Comment } from '../types';

interface CommentsListProps {
    comments: Comment[];
}

export function CommentsList({ comments }: CommentsListProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Comments</h3>
            {comments.length === 0 ? (
                <p className="text-gray-500">No comments yet.</p>
            ) : (
                <ul className="space-y-2">
                    {comments.map(comment => (
                        <li key={comment.id} className="p-2 bg-gray-100 rounded">
                            <p className="text-sm text-gray-800">{comment.text}</p>
                            <p className="text-xs text-gray-500">Posted by {comment.userId} on {comment.createdAt.toLocaleDateString()}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
