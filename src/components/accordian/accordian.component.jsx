import React, { useEffect, useState } from 'react';
import { AccordianTitle, Panel } from './accordian.styles';
import { Box, Flex } from 'reflexbox';
import { withTheme } from '@emotion/react';
import cal from '../../assets/images/calendar.png';
import minus from '../../assets/svgs/minus';
import plus from '../../assets/svgs/plus';
import { InfoPopup } from '../info-popup';
import { Events, EventsWrapper, Link, SmallText, Text, TextBold, Circle } from '../info-card/info-card.styles';
import moment from 'moment'; // Import moment.js
import 'moment-timezone'; // Import moment-timezone for timezone support
import formatDate from '../../helpers/format-date'; // Adjust path as per your project structure

const Accordian = ({ theme, title, children, width = "100%", active = false, infoBox, events }) => {

  const [isActive, setIsActive] = useState(active);
  const [showCalendar, setShowCalendar] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [calendar, setCalendar] = useState(null);

  useEffect(() => {
    if (!events || events.length === 0) {
      setFilteredEvents([]);
      return;
    }

    const sortedEvents = events
      .sort((a, b) => new Date(`${a.acf.date_from} ${a.acf.time || '00:00'}`) - new Date(`${b.acf.date_from} ${b.acf.time_end || '00:00'}`))
      .filter(event => new Date(event.acf.date_from).getTime() >= Date.now());

    setFilteredEvents(sortedEvents);
  }, [events]);

  useEffect(() => {
    if (!filteredEvents || filteredEvents.length === 0) {
      setCalendar(null);
      return;
    }

    const calendarInstance = window.ics();

    filteredEvents.forEach(event => {
      const startDate = moment.utc(`${event.acf.date_from} ${event.acf.time || '00:00'}`).toISOString();
      const endDate = moment.utc(`${event.acf.date_to || event.acf.date_from} ${event.acf.time_end || '00:00'}`).toISOString();

      calendarInstance.addEvent(event.acf.title, event.acf.description, "", startDate, endDate);
    });

    setCalendar(calendarInstance);
  }, [filteredEvents]);

  const onDownloadClick = () => {
    if (!calendar) return;
    calendar.download(`${title} FMC Events`);
  }

  return (
    <Box onClick={() => showCalendar && setShowCalendar(false)} marginBottom={theme.spacing[1]} width={width}>
      {title && <AccordianTitle alignItems="center" justifyContent="space-between" onClick={() => setIsActive(!isActive)}>
        <Flex alignItems="center">
          {title}
          {infoBox && <Box marginLeft="1rem">
            <InfoPopup width="37rem">
              {infoBox}
            </InfoPopup>
          </Box>}
        </Flex>
        {isActive ? minus : plus}
      </AccordianTitle>}
      <Panel active={isActive}>
        {filteredEvents.length > 0 && <EventsWrapper onClick={() => setShowCalendar(true)} marginTop="1rem" marginBottom="3rem">
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
        </EventsWrapper>}
        {children && children}
      </Panel>
    </Box>
  );
}

export default withTheme(Accordian);
