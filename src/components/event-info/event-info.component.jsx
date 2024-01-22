import React from "react";
import { Flex } from "reflexbox";
import { Image, Wrapper, Title, Text, Circle, ContentWrapper, OverflowWrapper, BackArrow } from "./event-info.styles";
import { withTheme } from "@emotion/react";

const EventInfo = ({ theme, title, date, dateEnd, time, timeEnd, description, image, colour = theme.colors.primary, onClick }) => {

  const formatICSDate = (date, time) => {
    if (!date) {
      return "";
    }
  
    const dateObj = new Date(date);
  
    // Check if time is available and has a valid format
    if (time && /^(\d{2}:\d{2})$/.test(time)) {
      const timeParts = time.split(":");
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
  
      if (!isNaN(hours) && !isNaN(minutes)) {
        dateObj.setHours(hours, minutes);
      }
    }
  
    // Format the date and time as "YYYYMMDDTHHMMSSZ"
    const year = dateObj.getUTCFullYear();
    const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getUTCDate().toString().padStart(2, '0');
    const hours = dateObj.getUTCHours().toString().padStart(2, '0');
    const minutes = dateObj.getUTCMinutes().toString().padStart(2, '0');
    const seconds = dateObj.getUTCSeconds().toString().padStart(2, '0');
  
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  };
  
  

  const generateCalendarData = (startDate, endDate) => {
    const formattedStartDate = formatICSDate(startDate, time);
    const formattedEndDate = formatICSDate(endDate, time);
  
    const calendarData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:CALENDAR
BEGIN:VEVENT
SUMMARY:${title}
DTSTART:${formattedStartDate}
DTEND:${formattedEndDate}
DESCRIPTION:${description || ""}
END:VEVENT
END:VCALENDAR
        `.trim();
  
    return calendarData;
  };
  
  

  const handleDownload = () => {
    if (!date && !dateEnd) {
      // Handle missing date and dateEnd
      return;
    }
  
    const startDateString = date ? date.split(" ") : [];
    const endDateString = dateEnd ? dateEnd.split(" ") : [];
  
    const months = {
      January: '01',
      February: '02',
      March: '03',
      April: '04',
      May: '05',
      June: '06',
      July: '07',
      August: '08',
      September: '09',
      October: '10',
      November: '11',
      December: '12',
    };
  
    let startDateStringWithoutTime;
    let endDateStringWithoutTime;
  
    if (startDateString.length === 4) {
      startDateStringWithoutTime = `${startDateString[3]}-${months[startDateString[2]]}-${startDateString[1].slice(0, -2)}`;
    }
  
    if (endDateString.length === 4) {
      endDateStringWithoutTime = `${endDateString[3]}-${months[endDateString[2]]}-${endDateString[1].slice(0, -2)}`;
    }
  
    if (startDateString.length === 5) {
      const startTime = startDateString[4].split(":");
      startDateStringWithoutTime += `T${startTime[0].padStart(2, '0')}${startTime[1].padStart(2, '0')}`;
    }
  
    if (endDateString.length === 5) {
      const endTime = endDateString[4].split(":");
      endDateStringWithoutTime += `T${endTime[0].padStart(2, '0')}${endTime[1].padStart(2, '0')}`;
    } else if (!dateEnd) {
      endDateStringWithoutTime = startDateStringWithoutTime;
    }
  
    const formattedStartDate = formatICSDate(startDateStringWithoutTime, time);
    const formattedEndDate = formatICSDate(endDateStringWithoutTime, timeEnd);
  
    const calendarData = generateCalendarData(formattedStartDate, formattedEndDate);
  
    // Create a data URL for the Blob
    const dataURL = `data:text/calendar;charset=utf-8,${encodeURIComponent(calendarData)}`;
  
    // Create a link element and trigger the download
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `${title}.ics`;
  
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            {timeEnd && <>, {timeEnd}</>}
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
          <OverflowWrapper scroll={image ? "scroll" : "auto"} height={image ? "8rem" : "auto"}>
            <Text dangerouslySetInnerHTML={{ __html: description.replace(/<a\b([^>]*)>(.*?)<\/a>/g, '<a style="font-size: inherit; text-decoration: underline 2px #e23734; text-underline-offset: 2px;" $1>$2</a>') }} />
          </OverflowWrapper>
        )}
        <Flex>
          <Text style={{ marginTop: "1.5rem", fontSize: "19px", textDecoration: "underline 2px #e23734", textUnderlineOffset: "5px" }}>
            <a style={{ color: "#e23734", fontWeight: 400 }} href="#" onClick={handleDownload}>
              iCal Download
            </a>
          </Text>
        </Flex>
      </ContentWrapper>
    </Wrapper>
  );
};

export default withTheme(EventInfo);
