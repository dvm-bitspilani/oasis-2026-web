import * as yup from "yup";
export const sampleIdentity={name:"Demo Visitor",email_id:"visitor@example.com",gender:"Male",phone:"9999999999",college_id:"1",year:"2",state:"Rajasthan",city:"Pilani",dob:"2003-01-01"};
export const demoColleges=[{value:"1",label:"BITS Pilani (sample)"},{value:"2",label:"Sample College"}];
export const demoEvents=[{id:1,name:"Sample Stage Play",about:"Sample registration selection. Historical event information is available on the Events page."},{id:2,name:"Sample Music Performance",about:"Sample registration fixture; no booking or payment."},{id:3,name:"Sample Dance Showcase",about:"Sample registration fixture; no booking or payment."}];
export function confirmDemo(ids:number[]){if(!ids.length)return {ok:false,message:"Select at least one sample event."};if(ids.some(id=>!demoEvents.some(e=>e.id===id)))return {ok:false,message:"Select a valid sample event."};return {ok:true,message:`Demo confirmed for ${ids.length} sample event(s). No booking, account, payment or email was created. Refresh to reset.`}}

export const registrationSchema = yup.object({
  name: yup.string().required("Name is required"),

  email_id: yup.string().email("Invalid email"),

  gender: yup.string().required("Gender is required"),

  phone: yup
    .string()
    .matches(/^[1-9]\d{9}$/, "Invalid number")
    .required("Mobile number is required"),

  college_id: yup.string().required("College is required"),

  year: yup.string().required("Field is required"),

  state: yup.string().required("State is required"),

  city: yup.string().required("City is required"),

  dob: yup.string().required("Date of birth is required"),
});

