import {ThemeProvider} from '@sanity/ui'
import {buildTheme} from '@sanity/ui/theme'
import {render, RenderOptions, RenderResult} from '@testing-library/react'
import React, {ReactElement} from 'react'

const AllProviders: React.FC<{children: React.ReactNode}> = ({children}) => {
  const theme = buildTheme()
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>): RenderResult => {
  return render(ui, {
    wrapper: ({children}) => <AllProviders>{children}</AllProviders>,
    ...options,
  })
}

export {customRender as render}
