import React, { useEffect, useState } from 'react';
import { Box, Flex } from 'reflexbox';
import { withTheme } from '@emotion/react';
import cal from '../../assets/images/calendar.png';
import minus from '../../assets/svgs/minus';
import plus from '../../assets/svgs/plus';
import { InfoPopup } from '../info-popup';
import { Events, EventsWrapper, Link, SmallText, Text, TextBold, Circle } from '../info-card/info-card.styles';
import formatDate from '../../helpers/format-date';

const Accordian = ({ theme, title, children, width = '100%', active = false, infoBox, events }) => {

  const [isActive, setIsActive] = useState(active);
  const [showCalendar, setShowCalendar] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState(null);
  const [calendar, setCalendar] = useState(null);

  useEffect(() => {
    if (!events) return;
    const formattedEvents = events.map(event => {
      const dtStart = new Date(`${event.acf.date_from}T${event.acf.time || '00:00'}Z`).toISOString();
      const dtEnd = event.acf.date_to ?
        new Date(`${event.acf.date_to}T${event.acf.time_end || '23:59'}Z`).toISOString() :
        new Date(`${event.acf.date_from}T${event.acf.time_end || '23:59'}Z`).toISOString();

      return {
        ...event,
        dtStart,
        dtEnd,
      };
    });

    setFilteredEvents(formattedEvents);
  }, [events]);

  useEffect(() => {
    if (!filteredEvents) return;

    const calendarInstance = window.ics();
    filteredEvents.forEach(event => {
      calendarInstance.addEvent(
        event.acf.title,
        event.acf.description,
        '',
        event.dtStart,
        event.dtEnd
      );
    });

    setCalendar(calendarInstance);
  }, [filteredEvents]);

  const handleOnClick = () => {
    setIsActive(!isActive);
  };

  const onDownloadClick = () => {
    if (!calendar) return;

    filteredEvents.forEach(event => {
      calendar.addEvent(
        event.acf.title,
        event.acf.description,
        '',
        event.dtStart,
        event.dtEnd
      );
    });

    calendar.download(`${title} FMC Events`);
  };

  return (
    <Box onClick={() => showCalendar && setShowCalendar(false)} marginBottom={theme.spacing[1]} width={width}>
      {title && (
        <Flex alignItems="center" justifyContent="space-between" onClick={handleOnClick}>
          {title}
          {infoBox && (
            <Box marginLeft="1rem">
              <InfoPopup width="37rem">
                {infoBox}
              </InfoPopup>
            </Box>
          )}
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
