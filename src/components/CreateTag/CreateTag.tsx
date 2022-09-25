import { useState } from 'react'
import { Loader } from '../Loader'
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
  const {
    data: {
      createUser: { id }
    }
  } = useUser()
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

  if (loading) return <Loader />

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()

        await createTag({
          variables: {
            input: {
              authorID: id,
              title: formData.title
            }
          }
        })
      }}
    >
      <input
        type="text"
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />
    </form>
  )
}

export { CreateTag }
