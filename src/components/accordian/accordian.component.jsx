import React, { useEffect, useState } from 'react';
import { Box, Flex } from 'reflexbox';
import { withTheme } from '@emotion/react';
import cal from '../../assets/images/calendar.png';
import minus from '../../assets/svgs/minus';
import plus from '../../assets/svgs/plus';
import { InfoPopup } from '../info-popup';
import { Events, EventsWrapper, Link, SmallText, Text, TextBold, Circle } from '../info-card/info-card.styles';
import formatDate from '../../helpers/format-date'; // Ensure this helper is correctly implemented

const Accordian = ({ theme, title, children, width = '100%', active = false, infoBox, events }) => {
  const [isActive, setIsActive] = useState(active);
  const [showCalendar, setShowCalendar] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState(null);
  const [calendar, setCalendar] = useState(null);

  useEffect(() => {
    if (!events) return;

    // Filter and sort events
    const filtered = events
      .filter(event => {
        const currentDate = new Date();
        return currentDate <= new Date(event.acf.date_from);
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.acf.date_from} ${a.acf.time}`);
        const dateB = new Date(`${b.acf.date_from} ${b.acf.time}`);
        return dateA - dateB;
      });

    setFilteredEvents(filtered);
  }, [events]);

  useEffect(() => {
    if (!filteredEvents) return;

    // Initialize the calendar instance
    const calendarInstance = window.ics();

    // Prepare events for the calendar
    filteredEvents.forEach(event => {
      const startDate = new Date(`${event.acf.date_from} ${event.acf.time}`);
      const endDate = event.acf.date_to ? new Date(`${event.acf.date_to} ${event.acf.time_end}`) : startDate;

      calendarInstance.addEvent(
        event.acf.title,
        event.acf.description,
        '',
        startDate,
        endDate
      );
    });

    setCalendar(calendarInstance);
  }, [filteredEvents]);

  const handleOnClick = () => {
    setIsActive(!isActive);
  };

  const onDownloadClick = () => {
    if (calendar) {
      calendar.download(`${title} FMC Events`);
    }
  };

  return (
    <Box onClick={() => showCalendar && setShowCalendar(false)} marginBottom={theme.spacing[1]} width={width}>
      {title && (
        <Flex alignItems="center" justifyContent="space-between" onClick={handleOnClick}>
          <Flex alignItems="center">
            {title}
            {infoBox && (
              <Box marginLeft="1rem">
                <InfoPopup width="37rem">{infoBox}</InfoPopup>
              </Box>
            )}
          </Flex>
          {isActive ? minus : plus}
        </Flex>
      )}
      <Box active={isActive}>
        {filteredEvents && (
          <EventsWrapper onClick={() => setShowCalendar(true)} marginTop="1rem" marginBottom="3rem">
            <img style={{ width: '2.5rem', marginRight: '0.5rem' }} alt="calendar" src={cal} />
            <TextBold primary={false}>Upcoming Events</TextBold>
            <Events show={showCalendar}>
              {filteredEvents.map(event => (
                <Flex marginBottom="0.5rem" key={event.id}>
                  <Circle color={event.acf.category[0]?.acf.colour} />
                  <Flex flexDirection="column">
                    <SmallText primary={false}>
                      {`${formatDate(event.acf.date_from)} ${event.acf.time}`}
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
        {children && children}
      </Box>
    </Box>
  );
};

export default withTheme(Accordian);
