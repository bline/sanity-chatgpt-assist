import {Box, useTheme} from '@sanity/ui'
import React from 'react'

import {ChatBoxProps} from '../types'

export const ChatBox: React.FC<ChatBoxProps> = ({colors, children, ...props}) => {
    const theme = useTheme()
    const isDarkMode = theme.sanity.v2?.color._dark || false
    const [lightColor, darkColor] = colors
    return (
        <Box
            padding={3}
            style={{
                backgroundColor: isDarkMode ? darkColor : lightColor,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                borderRadius: '5px',
                position: 'relative',
                whiteSpace: 'pre-wrap',
            }}
            marginBottom={4}
            {...props}
        >
            {children}
        </Box>
    )
}
