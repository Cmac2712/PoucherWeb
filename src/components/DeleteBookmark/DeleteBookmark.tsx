import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { useDeleteBookmark } from '../../api/hooks'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog'

interface Props {
  id?: string
  authorID?: string
}

export const DeleteBookmark = ({ id }: Props) => {
  const [open, setOpen] = useState(false)
  const deleteBookmarkMutation = useDeleteBookmark()

  return (
    <>
      <Button
        size="sm"
        variant="destructive"
        className="font-bold"
        onClick={(e) => {
          e.preventDefault()
          setOpen(true)
        }}
      >
        <FontAwesomeIcon icon={faTrashCan} />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-8">
          <DialogHeader className="mb-2">
            <DialogTitle>Delete bookmark</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this bookmark? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (id) {
                  deleteBookmarkMutation.mutate(id)
                }
                setOpen(false)
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
