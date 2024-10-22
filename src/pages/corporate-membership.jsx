import React, { useState } from "react";
import { H1Title } from "../components/styles";
import { ImageBox } from "../components/image-box";
import getData from "../helpers/get-data";
import { Flex } from "reflexbox";
import { Loading } from "../components/loading";
import { useEffectOnce } from "../hooks/use-effect-once";
import cal from '../assets/images/calendar.png';
import DownloadIcon from '../assets/svgs/download-event';
import { SmallText } from '../components/info-card/info-card.styles';
import formatDate from '../helpers/format-date';

// Modal Component for displaying event details
const Modal = ({ show, onClose, event }) => {
  if (!show || !event) {
    return null;
  }

  // Styles for modal
  const modalStyles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: "99",
    },
    content: {
      background: "white",
      padding: "4px 25px 20px 25px",
      borderRadius: "8px",
      maxWidth: "50rem",
      width: "100%",
      position: "relative",
      zIndex: "99",
      margin: "0 10px",
    },
    closeButton: {
      position: "absolute",
      top: "-13px",
      right: "-13px",
      background: "white",
      fontSize: "19px",
      cursor: "pointer",
      color: "#e23734",
      borderRadius: "50px",
      fontWeight: "800",
      fontFamily: "auto",
      height: "24px",
      width: "24px",
      maxWidth:"24px",
      padding:"0",
      lineHeight: "0",
      border: "solid 1px",
    },
  };

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

    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const seconds = dateObj.getSeconds().toString().padStart(2, '0');

    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  };

  const generateCalendarData = (startDate, endDate, startTime, endTime) => {
    const formattedStartDate = formatICSDate(startDate, startTime);
    let formattedEndDate;

    if (endDate) {
      formattedEndDate = formatICSDate(endDate, endTime || startTime);
    } else {
      formattedEndDate = formatICSDate(startDate, endTime || startTime);
    }

    // Provide a default description if none is given
    const description = event.acf.description ? event.acf.description : " ";

    const calendarData = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:CALENDAR
BEGIN:VEVENT
SUMMARY:${event.post_title}
DTSTART:${formattedStartDate}
DTEND:${formattedEndDate}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR`.trim();

    const blob = new Blob([calendarData], { type: 'text/calendar;charset=utf-8' });
    return window.URL.createObjectURL(blob);
  };


  const handleDownload = () => {
    const { date_from, date_to, time, time_end } = event.acf;

    if (date_from) {
      const calendarDataUrl = generateCalendarData(
        date_from,
        date_to || date_from,
        time,
        time_end
      );

      const link = document.createElement('a');
      link.href = calendarDataUrl;
      link.download = `${event.post_title.replace(/\s+/g, '_')}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(calendarDataUrl);
    } else {
      console.warn("No start date provided for event.");
    }
  };


  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.content} onClick={(e) => e.stopPropagation()}>
        <button
          style={modalStyles.closeButton}
          onClick={onClose}
          aria-label="Close Modal"
        >
          &times;
        </button>
        <Flex justifyContent="space-between" alignItems="center">
          <SmallText style={{ fontSize: "16px", color: "black", paddingBottom: "6px", paddingRight: "50px", margin: "-33px 0 0 0" }}>
            {`${formatDate(event.acf.date_from)} ${event.acf.time}`}
          </SmallText>
          <button
            style={{ display: "block", background: "none", height: "7rem", border: "none" }}
            onClick={handleDownload}
          >
            <div style={{ marginTop: "-5rem", width: "6rem", height: "6rem", display: "flex", cursor:"pointer" }}>
              <DownloadIcon />
            </div>
          </button>
        </Flex>
        <h2 style={{ fontSize: "14px", maxWidth: "31rem", fontWeight: 500, marginTop: "-3rem" }}>{event.post_title}</h2>
      </div>
    </div>
  );
};

const CorporateMembership = () => {
  const [corporateMembers, setCorporateMembers] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffectOnce(() => {
    getData(null, 368, setCorporateMembers).catch(console.error);
  }, []);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setIsModalOpen(false);
  };

  return (
    <>
      {!corporateMembers ? (
        <Loading />
      ) : (
        <>
          <H1Title>{corporateMembers.acf && corporateMembers.acf.title}</H1Title>
          {corporateMembers.acf && corporateMembers.acf.benefits && (
            <div style={{ fontSize: "1.8rem", fontWeight: "400", padding: "0 5px", lineHeight: "30px" }}
              dangerouslySetInnerHTML={{
                __html: corporateMembers.acf.benefits,
              }}
            />
          )}

          {corporateMembers.acf && corporateMembers.acf.events && (
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              <ul style={{ display: "flex", flexWrap: "wrap", gap: "1.4rem 0", padding: "3rem 0 7rem 0" }}>
                {corporateMembers.acf.events.map((event, index) => (
                  <li key={index} style={{ display: "flex", backgroundColor: "#ffffff", padding: "26px 30px", fontWeight: "700", margin: "0px 20px 0px 0px" }}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleEventClick(event);
                      }}
                      style={{ fontSize: "16px" }}
                    >
                      {event.post_title}
                    </a>
                    <img style={{ height: "20px", width: "20px", marginLeft: "22px", position: "relative" }} alt="calendar" src={cal} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Modal show={isModalOpen} onClose={closeModal} event={selectedEvent} />

          {corporateMembers.acf && (
            <Flex flexWrap="wrap">
              {corporateMembers.acf.members.map(
                ({ acf: { name, link, associates, logo } }, i) => (
                  <ImageBox
                    key={i}
                    title={name}
                    link={link}
                    textList={associates && associates.map(({ text }) => text)}
                    image={logo.url}
                  />
                )
              )}
            </Flex>
          )}
        </>
      )}
    </>
  );
};

export default CorporateMembership;
