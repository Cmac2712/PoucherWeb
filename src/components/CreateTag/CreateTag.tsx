import { useState } from 'react'
import { useUser } from '../../contexts/user-context'
import { useCreateTag } from '../../api/hooks'

const CreateTag = () => {
  const { data } = useUser()
  const userId = data?.user.id

  const createTagMutation = useCreateTag()

  const [formData, setFormData] = useState({
    title: ''
  })

  return (
    <form
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
      <input
        disabled={createTagMutation.isPending}
        placeholder="Add new categories&hellip;"
        className="input input-md rounded-r-none"
        type="text"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />
      <button className="btn btn-md rounded-l-none normal-case">Add</button>
    </form>
  )
}

export { CreateTag }
