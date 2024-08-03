import { proxy, batch } from 'valtio';

import { type PostIDLessCommentDto } from '~/db/dto/comment.dto';

type PostID = string;

export const blogPostState = proxy<{
  postId: PostID;
  currentBlockId: string | null;
  comments: PostIDLessCommentDto[];
  replyingTo: PostIDLessCommentDto | null;
}>({
  postId: '',
  currentBlockId: null,
  comments: [],
  replyingTo: null,
});

export function batchUpdate(updateFn: () => void) {
  batch(updateFn);
}

export function addComment(comment: PostIDLessCommentDto) {
  batchUpdate(() => {
    blogPostState.comments.push(comment);
  });
}

export function replyTo(comment: PostIDLessCommentDto) {
  batchUpdate(() => {
    blogPostState.replyingTo = comment;
  });
}

export function clearReply() {
  batchUpdate(() => {
    blogPostState.replyingTo = null;
  });
}

export function focusBlock(blockId: string | null) {
  batchUpdate(() => {
    blogPostState.currentBlockId = blockId;
  });
}

export function clearBlockFocus() {
  batchUpdate(() => {
    blogPostState.currentBlockId = null;
  });
}
