import {afterEach, describe, expect, it, jest} from '@jest/globals'
import {render} from '@testing-library/react'
import React from 'react'

import HandlebarsIcon from '@/components/HandlebarsIcon'

describe('HandlebarsIcon', () => {
  it('renders correctly with default props', () => {
    const {container} = render(<HandlebarsIcon />)

    // Check if the SVG element is rendered
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()

    // Check the default attributes of the SVG element
    expect(svg).toHaveAttribute('width', '1em')
    expect(svg).toHaveAttribute('height', '1em')
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
    expect(svg).toHaveAttribute('fill', 'none')
    expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg')
  })

  it('applies passed props to the SVG element', () => {
    const {container} = render(<HandlebarsIcon width="2em" height="2em" />)

    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '2em')
    expect(svg).toHaveAttribute('height', '2em')
  })

  it('forwards the ref to the SVG element', () => {
    const ref = React.createRef<SVGSVGElement>()
    render(<HandlebarsIcon ref={ref} />)

    expect(ref.current).not.toBeNull()
    expect(ref.current?.tagName).toBe('svg')
  })

  it('renders the correct SVG paths', () => {
    const {container} = render(<HandlebarsIcon />)

    const paths = container.querySelectorAll('path')
    expect(paths.length).toBe(4)

    // Verify attributes for each path (example for the first path)
    expect(paths[0]).toHaveAttribute(
      'd',
      'm 13.398369,5.0536697 h 0.5 c 1.1046,0 2,0.89543 2,2 v 2 c 0,1.0000003 0.6,3.0000003 3,3.0000003 -1,0 -3,0.6 -3,3 v 2.0002 c 0,1.1046 -0.8954,1.9998 -2,1.9998 h -0.5',
    )
    expect(paths[0]).toHaveAttribute('style', expect.stringContaining('stroke: currentcolor'))
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
})
