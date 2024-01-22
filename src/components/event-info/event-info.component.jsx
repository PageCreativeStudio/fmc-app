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

    // Check if time is available
    if (time) {
      // Extract hours, minutes, and AM/PM from the time
      const timeParts = time.match(/(\d+):(\d+)\s*([ap]m)/i);
      if (!timeParts) {
        // If time format doesn't match, return the formatted date without any time
        return dateObj.toISOString().replace(/[:-]/g, "").replace(/\.000Z$/, "Z").substring(0, 8);
      }
      let hours = parseInt(timeParts[1], 10);
      const minutes = parseInt(timeParts[2], 10);
      const period = timeParts[3].toLowerCase();
      // Adjust hours if PM and not 12 PM
      if (period === "pm" && hours !== 12) {
        hours += 12;
      }
      // Set the time
      dateObj.setHours(hours, minutes);
    }

    // Format the date and time as "YYYYMMDDTHHMMSSZ"
    const formattedDate = dateObj.toISOString().replace(/[:-]/g, "").replace(/\.000Z$/, "Z");
    return formattedDate;
  };
  

  const generateCalendarData = (startDate, endDate) => {
    const formattedStartDate = formatICSDate(startDate, time);
    const formattedEndDate = formatICSDate(endDate, time);
  
    const eventTitle = title.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${eventTitle}_FMC_Events.ics`;
  
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
  
    return { filename, calendarData };
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
  
    // Initialize the start and end date strings without time
    let startDateStringWithoutTime;
    let endDateStringWithoutTime;
  
    if (startDateString.length === 4) {
      startDateStringWithoutTime = `${startDateString[3]}-${months[startDateString[2]]}-${startDateString[1].slice(0, -2)}`;
    }
  
    if (endDateString.length === 4) {
      endDateStringWithoutTime = `${endDateString[3]}-${months[endDateString[2]]}-${endDateString[1].slice(0, -2)}`;
    }
  
    // Check if time is available and append it if present
    if (startDateString.length === 5) {
      const startTime = startDateString[4].split(":");
      startDateStringWithoutTime += `T${startTime[0].padStart(2, '0')}${startTime[1].padStart(2, '0')}`;
    }
  
    if (endDateString.length === 5) {
      const endTime = endDateString[4].split(":");
      endDateStringWithoutTime += `T${endTime[0].padStart(2, '0')}${endTime[1].padStart(2, '0')}`;
    } else if (!dateEnd) {
      // If no time is available and there's no dateEnd, set endDateStringWithoutTime to startDateStringWithoutTime
      endDateStringWithoutTime = startDateStringWithoutTime;
    }
  
    // Format the data according to your custom structure
    const eventTitle = title.replace(/[^a-zA-Z0-9]/g, '_');
    const formattedStartDate = formatICSDate(startDateStringWithoutTime, time);
    const formattedEndDate = formatICSDate(endDateStringWithoutTime, timeEnd);
    const descriptionText = description || "";
  
    const customCalendarData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:CALENDAR
BEGIN:VEVENT
SUMMARY:${eventTitle}
DTSTART:${formattedStartDate}
DTEND:${formattedEndDate}
DESCRIPTION:${descriptionText}
END:VEVENT
END:VCALENDAR`;
  
    // Create a Blob with the custom data
    const customBlob = new Blob([customCalendarData], { type: 'text/calendar;charset=utf-8' });
  
    // Create a download link for the custom data
    const customLink = document.createElement('a');
    customLink.href = window.URL.createObjectURL(customBlob);
    customLink.setAttribute('download', `${eventTitle}_FMC_Events_Custom.ics`);
    document.body.appendChild(customLink);
  
    // Trigger the download for the custom data
    customLink.click();
  
    // Remove the link for the custom data from the document
    document.body.removeChild(customLink);
  
    // Now, use window.ics() for downloading as well
    const calendarInstance = window.ics();
    calendarInstance.addEvent(title, description || "", "", new Date(startDateStringWithoutTime), new Date(endDateStringWithoutTime));
    calendarInstance.download(`${eventTitle}_FMC_Events.ics`);
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
          <Text style={{ marginTop: "1.5rem", fonSize: "19px", textDecoration: "underline 2px #e23734", textUnderlineOffset: "5px" }}>
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
