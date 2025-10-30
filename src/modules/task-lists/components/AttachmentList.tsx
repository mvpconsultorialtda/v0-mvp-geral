
import { Attachment } from '../types';

interface AttachmentListProps {
    attachments: Attachment[];
}

export function AttachmentList({ attachments }: AttachmentListProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Attachments</h3>
            {attachments.length === 0 ? (
                <p className="text-gray-500">No attachments yet.</p>
            ) : (
                <ul className="space-y-2">
                    {attachments.map(attachment => (
                        <li key={attachment.id} className="p-2 bg-gray-100 rounded">
                            <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                {attachment.fileName}
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
