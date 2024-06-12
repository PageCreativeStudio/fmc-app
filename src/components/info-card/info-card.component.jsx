import React, { useEffect, useState } from "react";
import { Flex, Box } from "reflexbox";
import { Wrapper, Title, Text, SmallText, Image, TextBold, Circle, EventsWrapper, Events, Link } from "./info-card.styles";
import cal from '../../assets/images/calendar.png';
import formatDate from "../../helpers/format-date";

const InfoCard = ({ width, title, textList, phone1, phone2, email, primary, image, events }) => {
  const [show, setShow] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [calendar, setCalendar] = useState(null);

  const formatICSDate = (dateStr, timeStr) => {
    const date = new Date(`${dateStr}T${timeStr || '00:00'}`);
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };

  useEffect(() => {
    if (!events) return;

    const sortedEvents = events.sort((a, b) => {
      return new Date(`${a.acf.date_from}T${a.acf.time || '00:00'}`) - new Date(`${b.acf.date_from}T${b.acf.time || '00:00'}`);
    }).filter(event => {
      const currentDate = new Date();
      return currentDate.getTime() <= new Date(`${event.acf.date_from}T${event.acf.time || '00:00'}`).getTime();
    });

    setFilteredEvents(sortedEvents);
  }, [events]);

  useEffect(() => {
    if (filteredEvents.length === 0) return;

    const calendarInstance = window.ics();
    filteredEvents.forEach(event => {
      const startDate = formatICSDate(event.acf.date_from, event.acf.time);
      const endDate = formatICSDate(event.acf.date_to ? event.acf.date_to : event.acf.date_from, event.acf.time_end);

      calendarInstance.addEvent(
        event.acf.title,
        event.acf.description || "",
        "",
        startDate,
        endDate
      );
    });

    setCalendar(calendarInstance);
  }, [filteredEvents]);

  const onDownloadClick = () => {
    if (!calendar) return;
    calendar.download(`${title} FMC Events`);
  };

  return (
    <Wrapper onClick={() => show && setShow(false)} marginRight={['0', "2rem"]} marginBottom="2rem" flexDirection="column" primary={primary} justifyContent="center" width={width}>
      {image && <Image alt={`Image for ${title}`} src={image} />}
      {title && <Title primary={primary}>{title}</Title>}
      {textList && <Flex marginBottom="1rem" flexWrap="wrap">
        {textList.map((text, i) => (
          <SmallText primary={primary} key={i} dangerouslySetInnerHTML={{ __html: i !== textList.length - 1 ? `${text}&nbsp&nbsp•&nbsp&nbsp` : text }} />
        ))}
      </Flex>}
      <Flex flexWrap="wrap">
        {phone1 && <Text primary={primary}>{phone1}</Text>}
        {(phone1 && phone2) && <Text primary={primary}><Box margin="0 0.5rem">|</Box></Text>}
        {phone2 && <Text primary={primary}>{phone2}</Text>}
      </Flex>
      {email && <a href={`mailto:${email}`}><Text primary={primary}>{email}</Text></a>}
      {filteredEvents.length > 0 && <EventsWrapper onClick={() => setShow(true)} marginTop="1rem">
        <img style={{ width: '2.5rem', marginRight: '0.5rem' }} alt="calendar" src={cal} />
        <TextBold primary={primary}>Upcoming Events</TextBold>
        <Events show={show}>
          {filteredEvents.map(event => (
            <Flex marginBottom="0.5rem" key={event.id}>
              <Circle color={event.acf.category[0]?.acf.colour} />
              <Flex flexDirection="column">
                <SmallText primary={primary}>
                  {`${formatDate(event.acf.date_from)} ${event.acf.time}`}
                </SmallText>
                <Text primary={primary}>{event.acf.title}</Text>
              </Flex>
            </Flex>
          ))}
          <Link onClick={onDownloadClick} primary={primary}>
            Download
          </Link>
        </Events>
      </EventsWrapper>}
    </Wrapper>
  );
};

export default InfoCard;
