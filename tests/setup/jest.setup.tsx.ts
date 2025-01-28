import '@testing-library/jest-dom'
import 'jest-styled-components'

import {afterAll, beforeAll} from '@jest/globals'
import MatchMediaMock from 'jest-matchmedia-mock'

let matchMedia: MatchMediaMock

beforeAll(() => {
  matchMedia = new MatchMediaMock()
})

afterAll(() => {
  if (matchMedia) {
    matchMedia.clear()
  }
})
