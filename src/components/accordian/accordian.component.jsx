import React, { useEffect, useState } from 'react';
import { AccordianTitle, Panel } from './accordian.styles';
import { Box, Flex } from 'reflexbox';
import { withTheme } from '@emotion/react';
import cal from '../../assets/images/calendar.png';
import minus from '../../assets/svgs/minus';
import plus from '../../assets/svgs/plus';
import { InfoPopup } from '../info-popup';
import { Events, EventsWrapper, Link, SmallText, Text, TextBold, Circle } from '../info-card/info-card.styles';
import { parseISO } from 'date-fns';
import formatDate from '../../helpers/format-date';

const Accordian = ({ theme, title, children, width = "100%", active = false, infoBox, events }) => {
  const [isActive, setIsActive] = useState(active);
  const [showCalendar, setShowCalendar] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [calendar, setCalendar] = useState(null);

  useEffect(() => {
    if (!events) return;

    // Sort and filter events based on date
    const sortedEvents = events
      .filter(event => event.acf.date_from && parseISO(event.acf.date_from).getTime() >= Date.now())
      .sort((a, b) => new Date(`${a.acf.date_from} ${a.acf.time || '00:00'}`) - new Date(`${b.acf.date_from} ${b.acf.time_end || '00:00'}`));

    setFilteredEvents(sortedEvents);
  }, [events]);

  useEffect(() => {
    if (!filteredEvents.length) return;

    // Initialize the ics instance
    const calendarInstance = window.ics();

    // Add each event to the calendar instance
    filteredEvents.forEach(event => {
      const startDateTime = new Date(`${event.acf.date_from} ${event.acf.time || '00:00'}`);
      const endDateTime = new Date(`${event.acf.date_to || event.acf.date_from} ${event.acf.time_end || '00:00'}`);

      calendarInstance.addEvent(
        event.acf.title,
        event.acf.description || '',
        '',
        startDateTime.toISOString(),
        endDateTime.toISOString()
      );
    });

    // Set the calendar instance to state
    setCalendar(calendarInstance);
  }, [filteredEvents]);

  const onDownloadClick = () => {
    if (!calendar) return;
    calendar.download(`${title} FMC Events`);
  };

  const handleOnClick = () => {
    setIsActive(!isActive);
  };

  return (
    <Box onClick={() => showCalendar && setShowCalendar(false)} marginBottom={theme.spacing[1]} width={width}>
      {title && (
        <AccordianTitle alignItems="center" justifyContent="space-between" onClick={handleOnClick}>
          <Flex alignItems="center">
            {title}
            {infoBox && (
              <Box marginLeft="1rem">
                <InfoPopup width="37rem">{infoBox}</InfoPopup>
              </Box>
            )}
          </Flex>
          {isActive ? minus : plus}
        </AccordianTitle>
      )}
      <Panel active={isActive}>
        {filteredEvents.length > 0 && (
          <EventsWrapper onClick={() => setShowCalendar(true)} marginTop="1rem" marginBottom="3rem">
            <img style={{ width: '2.5rem', marginRight: '0.5rem' }} alt="calendar" src={cal} />
            <TextBold primary={false}>Upcoming Events</TextBold>
            <Events show={showCalendar}>
              {filteredEvents.map(event => (
                <Flex marginBottom="0.5rem" key={event.id}>
                  <Circle color={event.acf.category?.[0]?.acf.colour || '#000000'} />
                  <Flex flexDirection="column">
                    <SmallText primary={false}>
                      {`${formatDate(parseISO(event.acf.date_from))} ${event.acf.time || ''}`}
                    </SmallText>
                    <Text primary={false}>{event.acf.title}</Text>
                  </Flex>
                </Flex>
              ))}
              <Link onClick={onDownloadClick} primary={false}>
                Download
              </Link>
            </Events>
          </EventsWrapper>
        )}
        {children}
      </Panel>
    </Box>
  );
};

export default withTheme(Accordian);
