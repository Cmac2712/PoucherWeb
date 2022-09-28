import { useState } from 'react'
import { useMutation, gql } from '@apollo/client'
import { useUser } from '../../contexts/user-context'
import { Tag } from '../Tags'

const CREATE_TAG = gql`
  mutation CREATE_TAG($input: TagInput) {
    createTag(tag: $input) {
      ID
      bookmarkID
      title
      authorID
    }
  }
`

const CreateTag = () => {
  const { data: { createUser: { id } } = { createUser: { id: undefined } } } =
    useUser()
  const [createTag, { loading }] = useMutation<{
    createTag: Tag
  }>(CREATE_TAG, {
    // https://github.com/apollographql/apollo-client/issues/5419#issuecomment-1242511457
    update(cache) {
      cache.evict({ fieldName: 'createUser' })
    }
  })
  const [formData, setFormData] = useState({
    title: ''
  })

  //if (loading) return <Loader />

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()

        setFormData({ title: '' })

        await createTag({
          variables: {
            input: {
              authorID: id,
              title: formData.title,
              bookmarkID: JSON.stringify({ list: [] })
            }
          }
        })
      }}
    >
      <input
        disabled={loading}
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
