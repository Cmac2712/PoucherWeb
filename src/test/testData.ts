// Test user data - using Cognito UUID format
export const appState = {
  user: {
    sub: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'Timothy',
    email: 'tim@testemail.com',
    picture: 'https://unsplash.com/photos/xJsE87_f78s'
  }
}

export const mockUserResponse = {
  user: {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    email: 'tim@testemail.com',
    name: 'Timothy'
  },
  tags: [
    {
      ID: '7a142d8f-d448-4d28-9848-c9ea96deea64',
      authorID: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      bookmarkID:
        '{"list":["cb491bd7-f019-4361-b3fd-844ee1249dcc","6f9386a3-404f-41a6-a704-e01430d9a628","2c35d841-e0f0-465b-9691-631cf05922e7"]}',
      title: 'career'
    },
    {
      ID: '73fbb37c-d45a-4c1b-8f15-8fbf5d9177a3',
      authorID: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      bookmarkID: '{"list":["2c35d841-e0f0-465b-9691-631cf05922e7"]}',
      title: 'AI'
    },
    {
      ID: '97f8b64c-7031-47f9-a255-9e7049c05b19',
      authorID: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      bookmarkID: '{"list":["ea441025-6161-4298-ae65-7168489cc37b"]}',
      title: 'CSS'
    }
  ]
}

export const mockBookmarksResponse = {
  bookmarks: [
    {
      id: 'd720a278-5050-4b91-9edd-1e3510722f70',
      authorID: 'google-oauth2|2115113493319166107491',
      title: '@levelsio (Pieter Levels)',
      description:
        'A few years ago I sold all my stuff to explore the world, created 12 startups in 12 months and since then have been building companies as an indie maker: my most famous being Nomad List and Remote OK',
      url: 'https://levels.io/blog/',
      videoURL: null,
      screenshotURL:
        'https://levels.io/content/images/2020/11/photo-1442120108414-42e7ea50d0b5-2.jpeg',
      createdAt: '1664231782092'
    },
    {
      id: 'af7c58ec-306c-4e8f-b021-a2d16f0e6114',
      authorID: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      title: 'Boundary',
      description:
        'Boundary is a wireless burglar alarm and Smart Home security system designed in the UK by restless minds on a mission to safely outsmart crime.',
      url: 'http://Boundary.co.uk/',
      videoURL: null,
      screenshotURL: '',
      createdAt: '1664102035482'
    }
  ],
  count: 46
}
