import { SEARCH_BOOKMARKS } from '../contexts/page-context'
import { CREATE_USER } from '../contexts/user-context'

export const appState = {
  user: {
    sub: 'google-oauth2|12345',
    given_name: 'Timothy',
    email: 'tim@testemail.com',
    picture: 'https://unsplash.com/photos/xJsE87_f78s'
  }
}

export const mocks = [
  /**
 * 
  {
    request: {
      query: SEARCH_BOOKMARKS,
      variables: {
        offset: 0,
        limit: 15,
        input: {
          id: undefined,
          authorID: 'google-oauth2|12345',
          title: '',
          description: ''
        }
      }
    },
    response: {
      data: {
        searchBookmarks: [
          {
            id: 'd720a278-5050-4b91-9edd-1e3510722f70',
            authorID: 'google-oauth2|12345',
            title: '@levelsio (Pieter Levels)',
            description:
              'A few years ago I sold all my stuff to explore the world, created 12 startups in 12 months and since then have been building companies as an indie maker: my most famous being Nomad List and Remote OK',
            url: 'https://levels.io/blog/',
            videoURL: null,
            screenshotURL:
              'https://levels.io/content/images/2020/11/photo-1442120108414-42e7ea50d0b5-2.jpeg',
            createdAt: '1664231782092',
            __typename: 'Bookmark'
          },
          {
            id: 'af7c58ec-306c-4e8f-b021-a2d16f0e6114',
            authorID: 'google-oauth2|12345',
            title: 'Boundary',
            description:
              'Boundary is a wireless burglar alarm and Smart Home security system designed in the UK by restless minds on a mission to safely outsmart crime.',
            url: 'http://Boundary.co.uk/',
            videoURL: null,
            screenshotURL: '',
            createdAt: '1664102035482',
            __typename: 'Bookmark'
          },
          {
            id: '43205935-1d38-4f66-91c6-43b78bdfe12b',
            authorID: 'google-oauth2|12345',
            title: 'Birdy on Twitter',
            description:
              '“Best thing I’ve seen today so far and they’re taking turns 😭❤️”',
            url: 'https://twitter.com/little_birdy__/status/1558052488309350401',
            videoURL: null,
            screenshotURL:
              'https://pbs.twimg.com/ext_tw_video_thumb/1558052354376753155/pu/img/pbeYeI6dhvsNJmJh.jpg:large',
            createdAt: '1664101885777',
            __typename: 'Bookmark'
          },
          {
            id: '74ad07f7-90a3-45e4-beea-84bb4ca7ce75',
            authorID: 'google-oauth2|12345',
            title: 'Stefan Baumgartner on Twitter',
            description:
              "“Ok, this is exciting! I'm writing another book on TypeScript! This time I've partnered with @OReillyMedia to give you 100+ solutions to everyday TypeScript problems.\n\n2 Chapters are already up, and 35% of the book is already written.\n\nCheck it out:\n\nhttps://t.co/gZH8uH6JP7”",
            url: 'https://twitter.com/ddprrt/status/1570671811851067393',
            videoURL: null,
            screenshotURL: '',
            createdAt: '1663319587884',
            __typename: 'Bookmark'
          },
          {
            id: '9f2b7217-6e7b-482f-bed8-c37b2e657f3b',
            authorID: 'google-oauth2|12345',
            title: 'The Rust Programming Languge',
            description: 'This seems quite interesting',
            url: 'https://doc.rust-lang.org/book/',
            videoURL: null,
            screenshotURL: '',
            createdAt: '1663147179902',
            __typename: 'Bookmark'
          },
          {
            id: '37c7ace8-f9df-4e62-b969-56015a59c8a9',
            authorID: 'google-oauth2|12345',
            title: 'Building your own version of React',
            description: 'cool',
            url: 'https://andela.com/insights/building-your-own-version-of-react-from-scratch-part-1/',
            videoURL: null,
            screenshotURL:
              'https://andela.com/wp-content/uploads/2019/08/Smithing-e1566987451907.jpeg',
            createdAt: '1663108252971',
            __typename: 'Bookmark'
          },
          {
            id: '6f9386a3-404f-41a6-a704-e01430d9a628',
            authorID: 'google-oauth2|12345',
            title: 'Things to know before joining a startup',
            description:
              'How to evaluate Startup job offers. How to prepare for life at Startups.',
            url: 'https://foretecher.hashnode.dev/should-you-join-a-startup',
            videoURL: null,
            screenshotURL:
              'https://hashnode.com/utility/r?url=https%3A%2F%2Fcdn.hashnode.com%2Fres%2Fhashnode%2Fimage%2Funsplash%2FQckxruozjRg%2Fupload%2Fv1659985130282%2FoXn82PEX5b.jpeg%3Fw%3D1200%26h%3D630%26fit%3Dcrop%26crop%3Dentropy%26auto%3Dcompress%2Cformat%26format%3Dwebp%26fm%3Dpng',
            createdAt: '1663093687787',
            __typename: 'Bookmark'
          },
          {
            id: '023c6f36-905c-4d7f-b602-670e62facc29',
            authorID: 'google-oauth2|12345',
            title: 'When should one use HTML entities?',
            description:
              "This has been confusing me for some time. With the advent of UTF-8 as the de-facto standard in web development I'm not sure in which situations I'm supposed to use the HTML entities and for which o...",
            url: 'https://stackoverflow.com/questions/436615/when-should-one-use-html-entities',
            videoURL: null,
            screenshotURL:
              'https://cdn.sstatic.net/Sites/stackoverflow/Img/apple-touch-icon@2.png?v=73d79a89bded',
            createdAt: '1663065521215',
            __typename: 'Bookmark'
          },
          {
            id: '9aaead36-b006-4ee2-a136-3b4253e4af3c',
            authorID: 'google-oauth2|12345',
            title:
              'The Intelligent Brain (Audio Download): Richard J. Haier, The Great Courses, Richard J. Haier, The Great Courses: Amazon.co.uk: Books',
            description: '--',
            url: 'https://www.amazon.co.uk/The-Intelligent-Brain/dp/B07K8Z4L4Z',
            videoURL: null,
            screenshotURL: '',
            createdAt: '1663006995492',
            __typename: 'Bookmark'
          },
          {
            id: 'cb491bd7-f019-4361-b3fd-844ee1249dcc',
            authorID: 'google-oauth2|12345',
            title:
              'How to fix filter: blur() performance issue in Safari • Today I Learned',
            description:
              "The filter: blur() css property comes with a nasty performance drop in Safari, but there's a simple fix for it",
            url: 'https://graffino.com/til/CjT2jrcLHP-how-to-fix-filter-blur-performance-issue-in-safari',
            videoURL: null,
            screenshotURL: 'https://graffino.com/til/images/social.jpg',
            createdAt: '1662990635137',
            __typename: 'Bookmark'
          },
          {
            id: '2c35d841-e0f0-465b-9691-631cf05922e7',
            authorID: 'google-oauth2|12345',
            title:
              'George Hotz | Programming | stable diffusion, in tinygrad?!? can it happen? | Part1',
            description:
              'Date of stream 3 Sep 2022.Live-stream chat added as Subtitles/CC - English (Twitch Chat).Stream title: stable diffusion, in tinygrad?!? can it happen?Source ...',
            url: 'https://youtu.be/4V9VHt_YwFQ',
            videoURL: null,
            screenshotURL:
              'https://i.ytimg.com/vi/4V9VHt_YwFQ/maxresdefault.jpg',
            createdAt: '1662935780319',
            __typename: 'Bookmark'
          },
          {
            id: '82e3fcf1-c906-42c8-b336-a280fc5f3a45',
            authorID: 'google-oauth2|12345',
            title: 'Products by Indie Hackers',
            description:
              'Discover hundreds of businesses, startups, and side projects that are making money online, and learn how they got to where they are today.',
            url: 'https://www.indiehackers.com/products',
            videoURL: null,
            screenshotURL:
              'https://www.indiehackers.com/images/shareables/products.jpg',
            createdAt: '1662933837072',
            __typename: 'Bookmark'
          },
          {
            id: 'c7e40ea3-31b2-4d83-a9ec-7aa4d2abc85d',
            authorID: 'google-oauth2|12345',
            title: 'Medium Google Coding Interview With Ben Awad',
            description:
              'In this video, I conduct a medium-difficulty Google coding interview with Ben Awad, a software engineer and tech YouTuber. As a Google Software Engineer, I i...',
            url: 'https://youtu.be/4tYoVx0QoN0',
            videoURL: null,
            screenshotURL:
              'https://i.ytimg.com/vi/4tYoVx0QoN0/maxresdefault.jpg',
            createdAt: '1662826252431',
            __typename: 'Bookmark'
          },
          {
            id: '5fcedf90-dced-4f67-a259-f2c513c89427',
            authorID: 'google-oauth2|12345',
            title: 'Figen on Twitter',
            description: '“Again this! 🤣🤣”',
            url: 'https://twitter.com/_TheFigen/status/1568273863850561542?t=1sXAkA0hYGeEo1Kfo2YVZg&s=19',
            videoURL: null,
            screenshotURL:
              'https://pbs.twimg.com/ext_tw_video_thumb/1568273807323926528/pu/img/YAXW6OzIlr9s1Lr4.jpg:large',
            createdAt: '1662821824203',
            __typename: 'Bookmark'
          },
          {
            id: 'fcb4e7d5-9c6a-4370-abd6-af5de9b89f0e',
            authorID: 'google-oauth2|12345',
            title: 'A Life Engineered',
            description:
              'A great tech channel I stumbled upon which gives fantastic advice on career progression. Hosted by an L7 Amazon Engineering Manager',
            url: 'https://www.youtube.com/c/ALifeEngineered',
            videoURL: null,
            screenshotURL: '',
            createdAt: '1662738294287',
            __typename: 'Bookmark'
          }
        ],
        getBookmarksCount: 46
      }
    }
  },
 */
  {
    request: {
      query: CREATE_USER,
      variables: {
        user: {
          id: appState.user.sub,
          email: appState.user.email,
          name: appState.user.given_name
        },
        input: {
          user: {
            id: appState.user.sub
          }
        }
      }
    },
    result: {
      data: {
        createUser: {
          id: 'google-oauth2|12345',
          __typename: 'User'
        },
        getTags: [
          {
            ID: '7a142d8f-d448-4d28-9848-c9ea96deea64',
            authorID: 'google-oauth2|12345',
            bookmarkID:
              '{"list":["cb491bd7-f019-4361-b3fd-844ee1249dcc","6f9386a3-404f-41a6-a704-e01430d9a628","2c35d841-e0f0-465b-9691-631cf05922e7"]}',
            title: 'career',
            __typename: 'Tag'
          },
          {
            ID: '73fbb37c-d45a-4c1b-8f15-8fbf5d9177a3',
            authorID: 'google-oauth2|12345',
            bookmarkID: '{"list":["2c35d841-e0f0-465b-9691-631cf05922e7"]}',
            title: 'AI',
            __typename: 'Tag'
          },
          {
            ID: '97f8b64c-7031-47f9-a255-9e7049c05b19',
            authorID: 'google-oauth2|12345',
            bookmarkID: '{"list":["ea441025-6161-4298-ae65-7168489cc37b"]}',
            title: 'CSS',
            __typename: 'Tag'
          }
        ]
      }
    }
  }
]
