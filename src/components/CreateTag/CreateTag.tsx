import { useState } from 'react'
import { useUser } from '../../contexts/user-context'
import { useCreateTag } from '../../api/hooks'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

const CreateTag = () => {
  const { data } = useUser()
  const userId = data?.user.id

  const createTagMutation = useCreateTag()

  const [formData, setFormData] = useState({
    title: ''
  })

  return (
    <form
      className="flex"
      onSubmit={async (e) => {
        e.preventDefault()

        setFormData({ title: '' })

        await createTagMutation.mutateAsync({
          authorID: userId,
          title: formData.title,
          bookmarkID: JSON.stringify({ list: [] })
        })
      }}
    >
      <Input
        disabled={createTagMutation.isPending}
        placeholder="Add new categories…"
        className="rounded-r-none"
        type="text"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />
      <Button className="rounded-l-none normal-case">Add</Button>
    </form>
  )
}

export { CreateTag }
