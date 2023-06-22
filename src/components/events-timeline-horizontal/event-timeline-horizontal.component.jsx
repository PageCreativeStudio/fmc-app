import React from "react"
import { Box, Flex } from "reflexbox"
import { Circle, Line, Title, Wrapper, Text, DateWrapper } from "./event-timeline-horizontal.styles"
import { withTheme } from "@emotion/react"

const EventTimelineHorizontal = ({theme, events, title}) => {
  return (
    <Box>
      {title && <Box marginBottom={theme.spacing[1]}>
        <Title>{title}</Title>
      </Box>}
      <Wrapper>
        {events && events.map(({date, time, title, colour=theme.colour.primary}) => <DateWrapper flexDirection="column" key={title} minWidth="20rem" width="24rem" marginBottom={theme.spacing[1]} marginRight={theme.spacing[1]}>
          <Box maxWidth="24rem" marginBottom={theme.spacing[0]}>
            <Circle colour={colour} />
          </Box>
          <Box>
            {(date || time) && <Text>{date && date}{time && <>, {time}</>}</Text>}
            {title && <Title>{title}</Title>}
          </Box>
        </DateWrapper>)}
        <Line />
      </Wrapper>
    </Box>
  )
}

export default withTheme(EventTimelineHorizontal)