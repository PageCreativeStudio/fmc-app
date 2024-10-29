import React from "react";
import { Flex } from "reflexbox";
import { Image, Wrapper, Title, Text, Circle, ContentWrapper, OverflowWrapper, BackArrow } from "./event-info.styles";
import { withTheme } from "@emotion/react";

const EventInfo = ({ theme, title, date, dateEnd, time, timeEnd, description, image, colour = theme.colors.primary, onClick }) => {
  const formatICSDate = (date, time) => {
    const dateObj = new Date(date);

    if (time) {
      const timeParts = time.match(/(\d+):(\d+)\s*([ap]m)/i);
      if (timeParts) {
        let hours = parseInt(timeParts[1], 10);
        const minutes = parseInt(timeParts[2], 10);
        const period = timeParts[3].toLowerCase();
        if (period === "pm" && hours !== 12) hours += 12;
        if (period === "am" && hours === 12) hours = 0;
        dateObj.setHours(hours, minutes);
      } else {
        console.error(`Failed to parse time: ${time}`);
      }
    } else {
      dateObj.setHours(0, 0, 0, 0);
    }

    return dateObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const generateCalendarData = (startDate, endDate, startTime, endTime) => {
    const formattedStartDate = formatICSDate(startDate, startTime);
    let formattedEndDate;
    if (endDate) {
      formattedEndDate = formatICSDate(endDate, endTime || startTime);
    } else {
      // If no end date/time, set end time to 1 hour after start time
      const endDateObj = new Date(startDate);
      endDateObj.setHours(endDateObj.getHours() + 1);
      formattedEndDate = formatICSDate(endDateObj, endTime || startTime);
    }

    // Escape special characters in title andd escription
    const escapedTitle = title.replace(/[\\,;]/g, '\\$&');
    const escapedDescription = (description || '')
      .replace(/\n/g, '\\n')
      .replace(/[\\,;]/g, '\\$&')
      .replace(/<[^>]*>/g, ''); // Remove HTML tags

    const calendarData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CALENDAR//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${escapedTitle}`,
      `DTSTART:${formattedStartDate}`,
      `DTEND:${formattedEndDate}`,
      `DESCRIPTION:${escapedDescription}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    return calendarData;
  };

  const handleDownload = (e) => {
    e.preventDefault();

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
    } else if (startDateString.length === 5) {
      const startTime = startDateString[4].split(":");
      startDateStringWithoutTime = `${startDateString[3]}-${months[startDateString[2]]}-${startDateString[1].slice(0, -2)}T${startTime[0].padStart(2, '0')}${startTime[1].padStart(2, '0')}`;
    }

    if (endDateString.length === 4) {
      endDateStringWithoutTime = `${endDateString[3]}-${months[endDateString[2]]}-${endDateString[1].slice(0, -2)}`;
    } else if (endDateString.length === 5) {
      const endTime = endDateString[4].split(":");
      endDateStringWithoutTime = `${endDateString[3]}-${months[endDateString[2]]}-${endDateString[1].slice(0, -2)}T${endTime[0].padStart(2, '0')}${endTime[1].padStart(2, '0')}`;
    } else {
      endDateStringWithoutTime = startDateStringWithoutTime;
    }

    if (startDateStringWithoutTime) {
      const calendarData = generateCalendarData(
        new Date(startDateStringWithoutTime),
        endDateStringWithoutTime ? new Date(endDateStringWithoutTime) : null,
        time,
        timeEnd
      );

      // Detect iOS devices
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

      if (isIOS) {
        // For iOS devices, create a data URI and open in new tab
        const encodedData = encodeURIComponent(calendarData);
        window.open(`data:text/calendar;charset=utf8,${encodedData}`, '_blank');
      } else {
        // For other devices, use Blob and open in new tab
        const blob = new Blob([calendarData], { type: 'text/calendar;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        // Clean up the blob URL after a short delay
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 100);
      }
    } else {
      console.warn("No valid date provided for event.");
    }
  };


  return (
    <Wrapper colour={colour}>
      {image && <Image backgroundImage={image} />}
      <ContentWrapper>
        <BackArrow marginBottom={theme.spacing[0]}>
          <svg onClick={onClick} xmlns="http://www.w3.org/2000/svg" width="49" height="50" viewBox="0 0 49 50">
            <g id="Group_118" data-name="Group 118" transform="translate(-0.955)">
              <rect id="Rectangle_18" data-name="Rectangle 18" width="49" height="50" transform="translate(0.955)" fill="none" />
              <line id="Line_6" data-name="Line 6" x1="34" transform="translate(7.955 25)" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              <path id="Path_10" data-name="Path 10" d="M53.992,56,40,69.992,53.992,83.984" transform="translate(-32.021 -45.117)" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </g>
          </svg>
        </BackArrow>
        {(date || time) && <Text>{date && date} {time && <>, {time}</>} {timeEnd && <> - {timeEnd}</>} {dateEnd && <> - {dateEnd}</>}</Text>}
        {title && <Title><Flex paddingRight={theme.spacing[2]} alignItems="start"><Circle colour={colour} /> {title}</Flex></Title>}
        {description && <OverflowWrapper scroll={image ? "scroll" : "auto"} height={image ? "8rem" : "auto"}><Text dangerouslySetInnerHTML={{ __html: description.replace(/<a\b([^>]*)>(.*?)<\/a>/g, '<a style="font-size: inherit; text-decoration: underline 2px #e23734; text-underline-offset: 2px;" $1>$2</a>') }} /></OverflowWrapper>}
        <Flex><Text style={{ marginTop: "1.5rem", fonSize: "19px", textDecoration: "underline 2px #e23734", textUnderlineOffset: "5px" }}><a style={{ color: "#e23734", fontWeight: 400 }} href="#" onClick={handleDownload}>iCal Download</a></Text></Flex>
      </ContentWrapper>
    </Wrapper>
  );
};

export default withTheme(EventInfo);
