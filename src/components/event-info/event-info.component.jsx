import React from "react";
import { Flex } from "reflexbox";
import { Image, Wrapper, Title, Text, Circle, ContentWrapper, OverflowWrapper, BackArrow } from "./event-info.styles";
import { withTheme } from "@emotion/react";
import cal from "../../assets/images/calendar.png";
import formatDate from "../../helpers/format-date";

const EventInfo = ({ theme, title, date, dateEnd, time, description, image, colour = theme.colors.primary, onClick }) => {
  const generateCalendarData = () => {
    const formattedStartDate = formatDate(date);
    const formattedEndDate = formatDate(dateEnd);

    return `BEGIN:VCALENDAR
      VERSION:2.0
      BEGIN:VEVENT
      SUMMARY:${title}
      DESCRIPTION:${description}
      DTSTART:${formattedStartDate}
      DTEND:${formattedEndDate}
      END:VEVENT
      END:VCALENDAR`;
  };

  const handleDownload = () => {
    const calendarData = generateCalendarData();

    const element = document.createElement("a");
    const file = new Blob([calendarData], { type: "text/calendar" });
    element.href = URL.createObjectURL(file);
    element.download = "event.ics";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <Wrapper colour={colour}>
      {image && <Image backgroundImage={image} />}
      <ContentWrapper>
        <BackArrow marginBottom={theme.spacing[0]}>
          <svg onClick={onClick} xmlns="http://www.w3.org/2000/svg" width="49" height="50" viewBox="0 0 49 50">
            <g id="Group_118" data-name="Group 118" transform="translate(-0.955)">
              <rect id="Rectangle_18" data-name="Rectangle 18" width="49" height="50" transform="translate(0.955)" fill="none" />
              <line
                id="Line_6"
                data-name="Line 6"
                x1="34"
                transform="translate(7.955 25)"
                fill="none"
                stroke="#000"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <path
                id="Path_10"
                data-name="Path 10"
                d="M53.992,56,40,69.992,53.992,83.984"
                transform="translate(-32.021 -45.117)"
                fill="none"
                stroke="#000"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </g>
          </svg>
        </BackArrow>
        {(date || time) && (
          <Text>
            {date && date}
            {time && <>, {time}</>}
            {dateEnd && <> - {dateEnd}</>}
          </Text>
        )}
        {title && (
          <Title>
            <Flex paddingRight={theme.spacing[2]} alignItems="start">
              <Circle colour={colour} />
              {title}
            </Flex>
          </Title>
        )}
        {description && (
          <OverflowWrapper scroll={image ? "scroll" : "auto"} height={image ? "30rem" : "auto"}>
            <Text dangerouslySetInnerHTML={{ __html: description.replace(/<a\b([^>]*)>(.*?)<\/a>/g, '<a style="font-size: inherit; text-decoration: underline 2px #e23734; text-underline-offset: 2px;" $1>$2</a>') }} />
          </OverflowWrapper>
        )}
      </ContentWrapper>
    </Wrapper>
  );
};

export default withTheme(EventInfo);
