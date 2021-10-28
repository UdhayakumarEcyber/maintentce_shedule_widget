import * as React from "react";
import { registerWidget, registerLink, registerUI, IContextProvider, } from './uxp';
 
import './styles.scss';
import {
    TitleBar,
    WidgetWrapper,
    FormField,
    Select,
    DataList,
  } from "uxp/components";

interface IWidgetProps {
    uxpContext?: IContextProvider,
    instanceId?: string
}
 
  
  const MaintenanceSchedule: React.FunctionComponent<IWidgetProps> =
    (props) => {
      const boxRef = React.useRef(null);
      let { uxpContext } = props;
      let [data, setdata] = React.useState<any>([]);
      let [NumOfEvents, setNumOfEvents] = React.useState<any>([]);
      let [currDate, setcurrDate] = React.useState<any>([]);
      let cardListView = [];
      let [selService, setselService] = React.useState<any>("");
      let [serviceOptions, setserviceOptions] = React.useState([]);
      let [CardsData, setCardsData] = React.useState<any>([]);
      let [Nums, setNums] = React.useState<any>([]);
      let [Times, setTimes] = React.useState<any>([]);
      let [StartEndTimes, setStartEndTimes] = React.useState<any>([]);
      let [eventsData, seteventsData] = React.useState<any>([]);
      let [eachCardTimeslot, seteachCardTimeslot] = React.useState<any>([]);
      let [cardTimings, setcardTimings] = React.useState<any>([]);
      let [PrevCardsTime, setPrevCardsTime] = React.useState<any>([]);
      let storePrevCardsTime: any[] = [];
  
      React.useEffect(() => {
        getMaintainenceSchedule();
      }, []);
  
      function handleChange(value: any) {
        MaintainloadData(value);
      }
  
      async function getMaintainenceSchedule() {
        let mdata = await props.uxpContext.executeAction(
          "AdaniDashboard",
          "MaintainenceSchedule_InitLoad",
          { json: true }
        );
        let md = JSON.parse(mdata);
        debugger;
        var newArray: Array<any> = [];
        md.MaintenanceService.forEach((i: any) => {
          newArray.push({
            label: i.ServiceCategoryName,
            value: i.ServiceCategoryKey,
            IsSelected: i.IsSelected,
          });
        });
        let obj = newArray.find((o) => o.IsSelected === "1");
        selService = obj.value;
        setserviceOptions(newArray);
        setselService(selService);
        MaintainenceScheduleInit(md);
        setdata(md.WRScheduleDatails);
      }
  
      async function MaintainloadData(selectedService: any) {
        let params = {
          ServiceCategoryKey: selectedService,
        };
        let md = await props.uxpContext.executeAction(
          "AdaniDashboard",
          "MaintainenceSchedule_LoadData",
          params,
          { json: true }
        );
        setselService(selectedService);
        MaintainenceScheduleInit(md);
        setdata(md.WRScheduleDatails);
      }
  
      function MaintainenceScheduleInit(value: any) {
        cardListView = [];
        // update cardListView with data retrieved
        for (const property in value.WRScheduleDatails) {
          if (value.WRScheduleDatails[property].length > 0) {
            let series_ = {
              name: property,
              cardMaxIndex: value.WRScheduleDatails[property].length,
              cardViewIndex: 0,
            };
            cardListView.push(Object.assign({}, series_));
          }
        }
        maindatainitial(value);
      }
  
      var timeSlotNums: any[] = [],
        num = 1,
        wr_start_hours,
        wr_start_time,
        wr_end_hours,
        wr_end_time;
      function maindatainitial(value: any) {
        //To get current timeslot
        var currentTime = new Date();
        var startSlotAt = currentTime.getHours() - 3;
        for (var t = 1; t <= 8; t++) {
          if (startSlotAt == 24) startSlotAt = 0;
          var d = document.getElementById(+t + "-line");
          d.classList.add(startSlotAt + "hour");
          timeSlotNums.push(startSlotAt);
          startSlotAt = startSlotAt + 1;
        }
        document.getElementById("company_list_ul").innerHTML = "";
  
        for (const property in value.Vendors) {
          var list = `<li>` + value.Vendors[property].VendorName + `</li>`;
          var li = document.getElementById("company_list_ul");
          li.insertAdjacentHTML("beforeend", list);
        }
        var subCards, lastkey: any;
        if (Object.keys(value.WRScheduleDatails).length > 6) {
          for (const property in value.WRScheduleDatails) {
            lastkey = `${property}`;
          }
        }
  
        let c = 0,
          storeEventNum = [],
          setSubCards = [],
          cardTimeSlot = [];
        (Times = []), (eventsData = []), (StartEndTimes = []);
        for (const property in value.WRScheduleDatails) {
          let cardNum = 0,
            hasCard = [],
            companyData = "";
          var eachDayCards: any[] = [],
            eventsTime = [],
            events = [],
            eventsStartEndTime = [];
          //If there is no cards for a day
          if (
            value.WRScheduleDatails[property].length == 0 &&
            (!(lastkey == property) || lastkey == undefined)
          ) {
            hasCard[num - 1] = 0;
            Nums[c] = num;
            cardTimeSlot.push(timeSlotNums);
            eachDayCards.push("null");
            storeEventNum[c] = 0;
            currDate[c] = property;
            num++;
            c++;
            eventsTime.push(null);
            eventsStartEndTime.push(null);
            events.push(null);
          } else if (
            (!(lastkey == property) && lastkey != null) ||
            lastkey == undefined
          ) {
            hasCard[num - 1] = 1;
            Nums[c] = num;
            subCards = "";
            let v = value.WRScheduleDatails[property];
            for (const p in v) {
              var wr_start_date = new Date(v[p].ScheduleStartDT);
              wr_start_hours =
                wr_start_date.getHours() > 12
                  ? wr_start_date.getHours() - 12
                  : wr_start_date.getHours();
              var wr_start_am_pm = wr_start_date.getHours() >= 12 ? "PM" : "AM";
              wr_start_hours =
                wr_start_hours < 10 ? "0" + wr_start_hours : wr_start_hours;
              var wr_start_minutes =
                wr_start_date.getMinutes() < 10
                  ? "0" + wr_start_date.getMinutes()
                  : wr_start_date.getMinutes();
              wr_start_time =
                wr_start_hours + ":" + wr_start_minutes + " " + wr_start_am_pm;
  
              var wr_end_date = new Date(v[p].ScheduleEndDT);
              wr_end_hours =
                wr_end_date.getHours() > 12
                  ? wr_end_date.getHours() - 12
                  : wr_end_date.getHours();
              var wr_end_am_pm = wr_end_date.getHours() >= 12 ? "PM" : "AM";
              wr_end_hours =
                wr_end_hours < 10 ? "0" + wr_end_hours : wr_end_hours;
              var wr_end_minutes =
                wr_end_date.getMinutes() < 10
                  ? "0" + wr_end_date.getMinutes()
                  : wr_end_date.getMinutes();
              wr_end_time =
                wr_end_hours + ":" + wr_end_minutes + " " + wr_end_am_pm;
  
              var fullDate = new Date(v[p].CardDetails.Date);
              var twoDigitMonth = fullDate.getMonth() + "";
              if (twoDigitMonth.length == 1) twoDigitMonth = "0" + twoDigitMonth;
              var twoDigitDate = fullDate.getDate() + "";
              if (twoDigitDate.length == 1) twoDigitDate = "0" + twoDigitDate;
              var maintain_shedule_date =
                twoDigitDate + "/" + twoDigitMonth + "/" + fullDate.getFullYear();
  
              eachDayCards.push(
                wr_start_date.getHours() + `-` + wr_end_date.getHours()
              );
  
              var color_class, color_class_Parent;
              if (v[p].CardDetails.Status == "Assignment") {
                color_class_Parent = "status-Assignment-Highlight";
                color_class = "status-Assignment";
              } else if (
                v[p].CardDetails.Status == "Upcoming" ||
                v[p].CardDetails.Status == "InProgress" ||
                v[p].CardDetails.Status == "Delayed"
              ) {
                color_class_Parent =
                  "status-upcoming-Inprogess-Delayed-Highlight";
                color_class = "status-upcoming-Inprogess-Delayed";
              } else if (
                v[p].CardDetails.Status == "Not Attended" ||
                v[p].CardDetails.Status == "Onhold" ||
                v[p].CardDetails.Status == "Closed"
              ) {
                color_class_Parent = "status-NotAttended-OnHold-Closed-Highlight";
                color_class = "status-NotAttended-OnHold-Closed";
              } else if (v[p].CardDetails.Status == "Complete") {
                color_class_Parent = "status-Complete-Hightlight";
                color_class = "status-Complete";
              } else if (v[p].CardDetails.Status == "Cancel") {
                color_class_Parent = "status-Cancel-Highlight";
                color_class = "status-Cancel";
              }
  
              var backgroundOfCards_child = "",
                paddingOfCards = "",
                marginTopOfCards = "";
              if (wr_start_date.getHours() + 1 == wr_end_date.getHours()) {
                paddingOfCards = 14 + "px" + " " + 0;
                backgroundOfCards_child = "singlehourMeetingCard-Child";
              } else if (wr_start_date.getHours() + 2 == wr_end_date.getHours()) {
                paddingOfCards = 29 + "px" + " " + 0;
                marginTopOfCards = 3 + "px";
              } else if (wr_start_date.getHours() + 3 == wr_end_date.getHours()) {
                // marginTopOfCards = 18 + 'px';
                paddingOfCards = 42 + "px" + " " + 0;
              } else {
                paddingOfCards = 36 + "px" + " " + 0;
              }
  
              if (wr_start_date.getHours() >= 12 && wr_start_date.getHours() < 18)
                marginTopOfCards = -23 + "px";
              else if (wr_start_date.getHours() >= 18)
                marginTopOfCards = -53 + "px";
  
              var removeStarBadge = "remove-star-badge";
              if (v[p].CardDetails.Status == "Assignment") removeStarBadge = "";
              var Cardstatus;
              if (v[p].CardDetails.Status == "Not Attended")
                Cardstatus = "NotAttended";
              else Cardstatus = v[p].CardDetails.Status;
  
              if (value.WRScheduleDatails[property].length > cardNum) {
                var f = document.createElement("h1");
                companyData =
                  `<div class="box-overall ` +
                  color_class_Parent +
                  ` ` +
                  removeStarBadge +
                  `" 
                        id='` +
                  property +
                  "-" +
                  wr_start_date.getHours() +
                  `-start-hour' style='margin-top: ` +
                  marginTopOfCards +
                  `; padding: ` +
                  paddingOfCards +
                  `'>
                          <div class='cards-nums-of-eachday'>` +
                  (cardNum + 1) +
                  `</div>
                          <div class="data_box blue-data_box company-hv-data ` +
                  color_class +
                  ` ` +
                  backgroundOfCards_child +
                  `">
                            <span>` +
                  v[p].Name +
                  `</span>
                            <p>` +
                  wr_start_time +
                  ` - ` +
                  wr_end_time +
                  `</p>    
                            <div class="maintain_shedule-box ` +
                  property +
                  "-" +
                  wr_start_date.getHours() +
                  `MSbox">                            
                              <h6>` +
                  v[p].CardDetails.Name +
                  `</h6>
                              <p>` +
                  v[p].CardDetails.Subject +
                  `</p>  
                              <ul>    
                                <li>   
                                  <label>Floor </label>
                                  <span>` +
                  v[p].CardDetails.Location +
                  `</span>
                                </li>
                                <li>   
                                  <label>System </label>
                                  <span>` +
                  v[p].CardDetails.System +
                  `</span>
                                </li>
                                <li>   
                                  <label>Reported Date </label>
                                  <span>` +
                  maintain_shedule_date +
                  `</span>
                                </li>                              
                                <li>   
                                  <label>Status </label>
                                  <span><em class="status-circle ` +
                  Cardstatus +
                  `"></em>` +
                  v[p].CardDetails.Status +
                  `</span>
                                </li>
                              </ul>  
                            </div>  
                          </div>`;
                cardNum = cardNum + 1;
              }
  
              eventsTime.push(wr_start_date.getHours());
              eventsStartEndTime.push(
                wr_start_date.getHours() + `-` + wr_end_date.getHours()
              );
              events.push(companyData);
              storePrevCardsTime.push(
                property + "-" + wr_start_date.getHours() + "-start-hour"
              );
            }
  
            cardTimeSlot.push(timeSlotNums);
            num++;
            currDate[c] = property;
            if (cardNum != undefined && cardNum != 0) {
              storeEventNum[c] = cardNum;
              c++;
            }
          }
          setSubCards.push(companyData);
          Times.push(eventsTime);
          StartEndTimes.push(eventsStartEndTime);
          eventsData.push(events);
          cardTimings[property] = eachDayCards;
        }
  
        seteachCardTimeslot(cardTimeSlot);
        //To remove previous filter cards
        if (
          document.getElementsByClassName("updatePrevCardsTime")[0].innerHTML !=
          ""
        ) {
          var cards = document
            .getElementsByClassName("updatePrevCardsTime")[0]
            .innerHTML.split("?");
          for (let c = 0; c < cards.length - 1; c++) {
            if (document.getElementById(cards[c]) != null)
              document.getElementById(cards[c]).remove();
          }
        }
        setNumOfEvents(storeEventNum);
        setCardsData(setSubCards);
        setTheCards(setSubCards);
        setPrevCardsTime(storePrevCardsTime);
  
        var widthOfhr;
        if (storeEventNum.length == 1) {
          document.getElementById("ButtonsDivParent").style.width = "11%";
          widthOfhr = "91px";
        } else if (storeEventNum.length == 2) {
          document.getElementById("ButtonsDivParent").style.width = "22%";
          widthOfhr = "185px";
        } else if (storeEventNum.length == 3) {
          document.getElementById("ButtonsDivParent").style.width = "34%";
          widthOfhr = "280px";
        } else if (storeEventNum.length == 4) {
          document.getElementById("ButtonsDivParent").style.width = "45%";
          widthOfhr = "374px";
        } else if (storeEventNum.length == 5) {
          document.getElementById("ButtonsDivParent").style.width = "57%";
          widthOfhr = "469px";
        } else if (storeEventNum.length == 6) {
          document.getElementById("ButtonsDivParent").style.width = "68%";
          widthOfhr = null;
        }
  
        if (widthOfhr != null) {
          for (let w = 1; w <= 8; w++) {
            document.getElementById(w + "-line").style.width = widthOfhr;
          }
        }
  
        currDate.forEach((i: any) => {
          var h = document.getElementById(i + "-card");
          if (h != null) h.scrollTo(0, timeSlotNums[0] * 34);
  
          //To check if the day is fall in Sunday or not
          var dtObj = new Date(i.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"));
          if (dtObj.getDay() == 0) {
            if (document.getElementById(i + "-card") != null)
              document.getElementById(i + "-card").style.background = "#e2e2e2c7";
          } else {
            if (document.getElementById(i + "-card") != null)
              document.getElementById(i + "-card").style.background = "#dcfeffbd";
          }
        });
  
        var a = 0;
        currDate.forEach((i: any) => {
          //To disable up and down button based on the card timings
          if (value.WRScheduleDatails[i] != undefined)
            var len = value.WRScheduleDatails[i].length;
          if (len != 0 && a < 6 && len != undefined) {
            if (
              StartEndTimes[a][StartEndTimes[a].length - 1].split("-")[1] <=
              timeSlotNums[7]
            ) {
              document.getElementById(i + "downBtn").classList.add("hide");
              document.getElementById(i + "upBtn").classList.remove("hide");
              document.getElementById(i + "eventsCount").style.marginLeft = "6px";
            } else if (StartEndTimes[a][0].split("-")[0] >= timeSlotNums[0]) {
              document.getElementById(i + "upBtn").classList.add("hide");
              document.getElementById(i + "downBtn").classList.remove("hide");
              document.getElementById(i + "eventsCount").style.marginLeft =
                "17px";
            }
  
            if (
              StartEndTimes[a][StartEndTimes[a].length - 1].split("-")[1] <=
                timeSlotNums[7] &&
              StartEndTimes[a][0].split("-")[0] >= timeSlotNums[0]
            ) {
              document.getElementById(i + "upBtn").classList.add("hide");
              document.getElementById(i + "downBtn").classList.add("hide");
              document.getElementById(i + "eventsCount").style.marginLeft =
                "17px";
            }
          } else if (len == 0) {
            document.getElementById(i + "upBtn").classList.add("hide");
            document.getElementById(i + "downBtn").classList.add("hide");
            document.getElementById(i + "eventsCount").style.marginLeft = "17px";
          }
          a++;
        });
      }
  
      function setTheCards(value: any) {
        for (let o = 1; o <= 6; o++) {
          for (let l = 0; l < Times.length; l++) {
            for (let m = 0; m < eventsData[l].length; m++) {
              if (Times[l][m] != null) {
                document.getElementById(
                  currDate[l] + "-" + Times[l][m] + "-appendDiv"
                ).innerHTML = eventsData[l][m];
              }
            }
          }
        }
      }
  
      //For up & down scroll button functionality
      var atTop = true,
        atLast = true;
      function upDownBtnEvent(CurDate: any, no: any, divNUm: any) {
        debugger
        if (
          (eachCardTimeslot[divNUm - 1][0] != 1 && no == 0) ||
          (eachCardTimeslot[divNUm - 1][7] != 23 && no == 1)
        ) {
          eachCardTimeslot[divNUm - 1] = eachCardTimeslot[divNUm - 1].map(
            function (entry: any) {
              if (no == 0) {
                return entry - 1;
              } else {
                return entry + 1;
              }
            }
          );
        }
  
        var curDateField = CurDate;
        if (
          cardTimings[curDateField][cardTimings[curDateField].length - 1].split(
            "-"
          )[1] > eachCardTimeslot[divNUm - 1][7] &&
          no == 0
        ) {
          document
            .getElementById(curDateField + "downBtn")
            .classList.remove("hide");
        } else if (
          cardTimings[curDateField][0].split("-")[0] <
            eachCardTimeslot[divNUm - 1][0] &&
          no == 1
        ) {
          document
            .getElementById(curDateField + "upBtn")
            .classList.remove("hide");
          document.getElementById(curDateField + "eventsCount").style.marginLeft =
            "6px";
        }
  
        if (
          cardTimings[curDateField][cardTimings[curDateField].length - 1].split(
            "-"
          )[1] <= eachCardTimeslot[divNUm - 1][7] &&
          no == 1
        ) {
          document.getElementById(curDateField + "downBtn").classList.add("hide");
        } else if (
          cardTimings[curDateField][0].split("-")[0] >=
          eachCardTimeslot[divNUm - 1][0]
        ) {
          document.getElementById(curDateField + "upBtn").classList.add("hide");
          document.getElementById(curDateField + "eventsCount").style.marginLeft =
            "16px";
        }
  
        var x = document.getElementById(CurDate + "-card");
        if (no == 0 && atTop) x.scrollTo(0, eachCardTimeslot[divNUm - 1][0] * 34);
        else if (no == 1 && atLast)
          x.scrollTo(0, eachCardTimeslot[divNUm - 1][0] * 34);
  
        if (eachCardTimeslot[divNUm - 1][0] == 1) atTop = false;
        else atTop = true;
        if (eachCardTimeslot[divNUm - 1][7] == 23) atLast = false;
        else atLast = true;
      }
  
      //To display the popup on mouseover
      function over(event: any) {
        var MTitle = document
          .getElementById("MaintainenceS")
          .getBoundingClientRect();
        if (document.getElementById("5-company_data_sec") != null)
          var lastCompanySec = document
            .getElementById("5-company_data_sec")
            .getBoundingClientRect();
        else if (document.getElementById("4-company_data_sec") != null)
          var lastCompanySec = document
            .getElementById("4-company_data_sec")
            .getBoundingClientRect();
        else if (document.getElementById("3-company_data_sec") != null)
          var lastCompanySec = document
            .getElementById("3-company_data_sec")
            .getBoundingClientRect();
        else if (document.getElementById("2-company_data_sec") != null)
          var lastCompanySec = document
            .getElementById("2-company_data_sec")
            .getBoundingClientRect();
        else if (document.getElementById("1-company_data_sec") != null)
          var lastCompanySec = document
            .getElementById("1-company_data_sec")
            .getBoundingClientRect();
  
        var i = event.currentTarget.id;
  
        if (i != null || i != undefined) {
          if (i.length == 22) var cdate = i.slice(0, 12);
          else var cdate = i.slice(0, 13);
        }
        var id = cdate + "-start-hour";
        var rect = document.getElementById(id).getBoundingClientRect();
        var h = document.getElementsByClassName(
          cdate + "MSbox"
        ) as HTMLCollectionOf<HTMLElement>;
  
        if (lastCompanySec.left == rect.left) {
          h[0].style.display = "block";
          h[0].style.top = "60px";
          h[0].style.left = "0p";
          h[0].style.right = "232px";
        } else if (lastCompanySec.left < rect.left) {
          h[0].style.display = "block";
          h[0].style.top = "60px";
          h[0].style.left = "0p";
          h[0].style.right = "130px";
        } else {
          h[0].style.top = "60px";
          h[0].style.left = (rect.left - 400).toString() + "px";
          h[0].style.display = "block";
        }
      }
  
      //To remove the popup
      function leave(event: any) {
        var i = event.currentTarget.id;
        if (i.length == 22) var cdate = i.slice(0, 12);
        else var cdate = i.slice(0, 13);
        var h = document.getElementsByClassName(
          cdate + "MSbox"
        ) as HTMLCollectionOf<HTMLElement>;
        h[0].style.display = "none";
      }
  
      return (
        <WidgetWrapper className="maintainence-widget">
          <div className="body bluebgdefault">
            <div className="visitors_count">
              <div className="visitors_count-top">
                <div className="box">
                  <FormField inline>
                    <Select
                      selected={selService}
                      onChange={(value) => {
                        handleChange(value);
                      }}
                      options={serviceOptions}
                      placeholder="select an item"
                    />
                  </FormField>
                </div>
                <p id="MaintainenceS">Maintainence Schedule</p>
              </div>
            </div>
            <div className="visitors_chart">
              <div className="company_list">
                <ul id="company_list_ul">
                  <li id="company_list_ul_li"></li>
                </ul>
              </div>
              <div className="company_data">
                <div className="company_data_timeslot">
                  <hr className="1-line" id="1-line" />
                  <hr className="2-line" id="2-line" />
                  <hr className="3-line" id="3-line" />
                  <hr className="4-line" id="4-line" />
                  <hr className="5-line" id="5-line" />
                  <hr className="6-line" id="6-line" />
                  <hr className="7-line" id="7-line" />
                  <hr className="8-line" id="8-line" />
                </div>
  
                <div className="company_data_data">
                  {NumOfEvents.map(function (object: any, i: any) {
                    return (
                      <div
                        className="company_data_sec"
                        id={`${Nums[i]}-company_data_sec`}
                      >
                        <h6>{currDate[i]}</h6>
                        <div
                          className={`company_data_cont_sec company_data_cont_blue_sec ${Nums[i]}-dayNumber`}
                          id={`${currDate[i]}-card`}
                        >
                          {(() => {
                            return (
                              <div className="totalhourData">
                                <div
                                  className="parent-card"
                                  id={`${currDate[i]}-0-appendDiv`}
                                  onMouseEnter={over.bind(this)}
                                  onMouseLeave={leave.bind(this)}
                                ></div>
                                <hr
                                  className={`${currDate[i]}-0-hr`}
                                  id={`${currDate[i]}-0-hr`}
                                />
                                <div
                                  className="parent-card"
                                  id={`${currDate[i]}-1-appendDiv`}
                                  onMouseEnter={over.bind(this)}
                                  onMouseLeave={leave.bind(this)}
                                ></div>
                                <hr
                                  className={`${currDate[i]}-1-hr`}
                                  id={`${currDate[i]}-1-hr`}
                                />
                                <div
                                  className="parent-card"
                                  id={`${currDate[i]}-2-appendDiv`}
                                  onMouseEnter={over.bind(this)}
                                  onMouseLeave={leave.bind(this)}
                                ></div>
                                <hr
                                  className={`${currDate[i]}-2-hr`}
                                  id={`${currDate[i]}-2-hr`}
                                />
                                <div
                                  className="parent-card"
                                  id={`${currDate[i]}-3-appendDiv`}
                                  onMouseEnter={over.bind(this)}
                                  onMouseLeave={leave.bind(this)}
                                ></div>
                                <hr
                                  className={`${currDate[i]}-3-hr`}
                                  id={`${currDate[i]}-3-hr`}
                                />
                                <div
                                  className="parent-card"
                                  id={`${currDate[i]}-4-appendDiv`}
                                  onMouseEnter={over.bind(this)}
                                  onMouseLeave={leave.bind(this)}
                                ></div>
                                <hr
                                  className={`${currDate[i]}-4-hr`}
                                  id={`${currDate[i]}-4-hr`}
                                />
                                <div
                                  className="parent-card"
                                  id={`${currDate[i]}-5-appendDiv`}
                                  onMouseEnter={over.bind(this)}
                                  onMouseLeave={leave.bind(this)}
                                ></div>
                                <hr
                                  className={`${currDate[i]}-5-hr`}
                                  id={`${currDate[i]}-5-hr`}
                                />
                                <div
                                  className="parent-card"
                                  id={`${currDate[i]}-6-appendDiv`}
                                  onMouseEnter={over.bind(this)}
                                  onMouseLeave={leave.bind(this)}
                                ></div>
                                <hr
                                  className={`${currDate[i]}-6-hr`}
                                  id={`${currDate[i]}-6-hr`}
                                />
                                <div
                                  className="parent-card"
                                  id={`${currDate[i]}-7-appendDiv`}
                                  onMouseEnter={over.bind(this)}
                                  onMouseLeave={leave.bind(this)}
                                ></div>
                                <hr
                                  className={`${currDate[i]}-7-hr`}
                                  id={`${currDate[i]}-7-hr`}
                                />
                                <div
                                  className="parent-card"
                                  id={`${currDate[i]}-8-appendDiv`}
                                  onMouseEnter={over.bind(this)}
                                  onMouseLeave={leave.bind(this)}
                                ></div>
                                <hr
                                  className={`${currDate[i]}-8-hr`}
                                  id={`${currDate[i]}-8-hr`}
                                />
                                <div
                                  className="parent-card"
                                  id={`${currDate[i]}-9-appendDiv`}
                                  onMouseEnter={over.bind(this)}
                                  onMouseLeave={leave.bind(this)}
                                ></div>
                                <hr
                                  className={`${currDate[i]}-9-hr`}
                                  id={`${currDate[i]}-9-hr`}
                                />
                                <div
                                  className="parent-card"
                                  id={`${currDate[i]}-10-appendDiv`}
                                  onMouseEnter={over.bind(this)}
                                  onMouseLeave={leave.bind(this)}
                                ></div>
                                <hr
                                  className={`${currDate[i]}-10-hr`}
                                  id={`${currDate[i]}-10-hr`}
                                />
                                <div
                                  className="parent-card"
                                  id={`${currDate[i]}-11-appendDiv`}
                                  onMouseEnter={over.bind(this)}
                                  onMouseLeave={leave.bind(this)}
                                ></div>
                                <hr
                                  className={`${currDate[i]}-11-hr`}
                                  id={`${currDate[i]}-11-hr`}
                                />
                                <div
                                  className="parent-card"
                                  id={`${currDate[i]}-12-appendDiv`}
                                  onMouseEnter={over.bind(this)}
                                  onMouseLeave={leave.bind(this)}
                                ></div>
                                <hr
                                  className={`${currDate[i]}-12-hr`}
                                  id={`${currDate[i]}-12-hr`}
                                />
                                <div
                                  className="parent-card"
                                  id={`${currDate[i]}-13-appendDiv`}
                                  ref={boxRef}
                                  onMouseEnter={over.bind(this)}
                                  onMouseLeave={leave.bind(this)}
                                ></div>
                                <hr
                                  className={`${currDate[i]}-13-hr`}
                                  id={`${currDate[i]}-13-hr`}
                                />
                                <div
                                  className="parent-card"
                                  id={`${currDate[i]}-14-appendDiv`}
                                  onMouseEnter={over.bind(this)}
                                  onMouseLeave={leave.bind(this)}
                                ></div>
                                <hr
                                  className={`${currDate[i]}-14-hr`}
                                  id={`${currDate[i]}-14-hr`}
                                />
                                <div
                                  className="parent-card"
                                  id={`${currDate[i]}-15-appendDiv`}
                                  onMouseEnter={over.bind(this)}
                                  onMouseLeave={leave.bind(this)}
                                ></div>
                                <hr
                                  className={`${currDate[i]}-15-hr`}
                                  id={`${currDate[i]}-15-hr`}
                                />
                                <div
                                  className="parent-card"
                                  id={`${currDate[i]}-16-appendDiv`}
                                  onMouseEnter={over.bind(this)}
                                  onMouseLeave={leave.bind(this)}
                                ></div>
                                <hr
                                  className={`${currDate[i]}-16-hr`}
                                  id={`${currDate[i]}-16-hr`}
                                />
                                <div
                                  className="parent-card"
                                  id={`${currDate[i]}-17-appendDiv`}
                                  onMouseEnter={over.bind(this)}
                                  onMouseLeave={leave.bind(this)}
                                ></div>
                                <hr
                                  className={`${currDate[i]}-17-hr`}
                                  id={`${currDate[i]}-17-hr`}
                                />
                                <div
                                  className="parent-card"
                                  id={`${currDate[i]}-18-appendDiv`}
                                  onMouseEnter={over.bind(this)}
                                  onMouseLeave={leave.bind(this)}
                                ></div>
                                <hr
                                  className={`${currDate[i]}-18-hr`}
                                  id={`${currDate[i]}-18-hr`}
                                />
                                <div
                                  className="parent-card"
                                  id={`${currDate[i]}-19-appendDiv`}
                                  onMouseEnter={over.bind(this)}
                                  onMouseLeave={leave.bind(this)}
                                ></div>
                                <hr
                                  className={`${currDate[i]}-19-hr`}
                                  id={`${currDate[i]}-19-hr`}
                                />
                                <div
                                  className="parent-card"
                                  id={`${currDate[i]}-20-appendDiv`}
                                  onMouseEnter={over.bind(this)}
                                  onMouseLeave={leave.bind(this)}
                                ></div>
                                <hr
                                  className={`${currDate[i]}-20-hr`}
                                  id={`${currDate[i]}-20-hr`}
                                />
                                <div
                                  className="parent-card"
                                  id={`${currDate[i]}-21-appendDiv`}
                                  onMouseEnter={over.bind(this)}
                                  onMouseLeave={leave.bind(this)}
                                ></div>
                                <hr
                                  className={`${currDate[i]}-21-hr`}
                                  id={`${currDate[i]}-21-hr`}
                                />
                                <div
                                  className="parent-card"
                                  id={`${currDate[i]}-22-appendDiv`}
                                  onMouseEnter={over.bind(this)}
                                  onMouseLeave={leave.bind(this)}
                                ></div>
                                <hr
                                  className={`${currDate[i]}-22-hr`}
                                  id={`${currDate[i]}-22-hr`}
                                />
                                <div
                                  className="parent-card"
                                  id={`${currDate[i]}-23-appendDiv`}
                                  onMouseEnter={over.bind(this)}
                                  onMouseLeave={leave.bind(this)}
                                ></div>
                                <hr
                                  className={`${currDate[i]}-23-hr`}
                                  id={`${currDate[i]}-23-hr`}
                                />
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })}
                </div>
  
                <div className="ButtonsDiv" id="ButtonsDivParent">
                  {NumOfEvents.map(function (object: any, i: any) {
                    return (
                      <div
                        className="data_events"
                        id={`${currDate[i]}data_events`}
                      >
                        <div
                          className="updownBtn upBtn"
                          id={`${currDate[i]}upBtn`}
                          onClick={() => {
                            upDownBtnEvent(currDate[i], 0, i + 1);
                          }}
                        ></div>
                        <h6 id={`${currDate[i]}eventsCount`}>
                          {NumOfEvents[i]} events{" "}
                        </h6>
                        <div
                          className="updownBtn downBtn"
                          id={`${currDate[i]}downBtn`}
                          onClick={() => {
                            upDownBtnEvent(currDate[i], 1, i + 1);
                          }}
                        ></div>
                      </div>
                    );
                  })}
                </div>
  
                <div className="updatePrevCardsTime">
                  {PrevCardsTime.map(function (object: any, i: any) {
                    return PrevCardsTime[i] + "?";
                  })}
                </div>
              </div>
            </div>
          </div>
        </WidgetWrapper>
      );
    };


registerWidget({
    id: "MaintenanceSchedule", 
    widget: MaintenanceSchedule,
    configs: {
        layout: {
            w: 22,
            h: 8,
            minW: 22,
            minH: 8
        }
    }
});

/**
 * Register as a Sidebar Link
 */
/*
registerLink({
    id: "maintentce_shedule_widget",
    label: "Maintentce_shedule_widget",
    // click: () => alert("Hello"),
    component: Maintentce_shedule_widgetWidget
});
*/

/**
 * Register as a UI
 */

 /*
registerUI({
    id:"maintentce_shedule_widget",
    component: Maintentce_shedule_widgetWidget
});
*/