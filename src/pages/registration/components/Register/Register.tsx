// import * as yup from "yup";
// import { yupResolver } from "@hookform/resolvers/yup";
// import Select from "react-select";
// import { useEffect, useState } from "react";
// import { useForm, Controller } from "react-hook-form";
// import axios from "axios";

// import styles from "./reg.module.scss";
// import Reginput from "./Reginput";

// import RegBg from "../../../assets/registration/reg/RegBg.png";
// import leftbottom from "../../../assets/registration/reg/leftbottom.png";
// import rightbottom from "../../../assets/registration/reg/rightbottom.png";
// import lefttop from "../../../assets/registration/reg/lefttop.png";
// import righttop from "../../../assets/registration/reg/righttop.png";
// import book from "../../../assets/registration/reg/book.png";
// import buttonBg from "../../../assets/registration/reg/buttonbg.png";

// import statesData from "./Register/cities.json";

// interface RegProps {
//   onClickNext: () => void;
//   userEmail: string;
//   setUserData: React.Dispatch<React.SetStateAction<any>>;
// }

// /* ---------------- VALIDATION ---------------- */

// const registrationSchema = yup.object({
//   name: yup
//     .string()
//     .required("Name is required"),

//   email_id: yup
//     .string()
//     .email("Invalid email"),

//   gender: yup
//     .string()
//     .required("Gender is required"),

//   phone: yup
//     .string()
//     .matches(
//       /^[1-9]\d{9}$/,
//       "Invalid number"
//     )
//     .required("Mobile number is required"),

//   college_id: yup
//     .string()
//     .required("College is required"),

//   year: yup
//     .string()
//     .required("Field is required"),

//   state: yup
//     .string()
//     .required("State is required"),

//   city: yup
//     .string()
//     .required("City is required"),
//     dob: yup
//   .string()
//   .required("Date of birth is required"),
// });

// type FormData = yup.InferType<
//   typeof registrationSchema
// >;

// /* ---------------- OPTIONS ---------------- */

// type GenderOption = {
//   value: "M" | "F" | "O";
//   label: string;
// };

// const genderOptions: GenderOption[] = [
//   {
//     value: "M",
//     label: "Male",
//   },
//   {
//     value: "F",
//     label: "Female",
//   },
//   {
//     value: "O",
//     label: "Other",
//   },
// ];

// const stateOptions = statesData.map(
//   (item) => ({
//     value: item.state,
//     label: item.state,
//   })
// );

// /* ---------------- COMPONENT ---------------- */

// export default function Reg({
//   onClickNext,
//   userEmail,
//   setUserData,
// }: RegProps) {
//   const [selectedState, setSelectedState] =
//     useState("");

//   const [
//     availableCities,
//     setAvailableCities,
//   ] = useState<
//     { value: string; label: string }[]
//   >([]);

//   const [
//     collegeOptions,
//     setCollegeOptions,
//   ] = useState<
//     { value: string; label: string }[]
//   >([]);

//   const [inputValue, setInputValue] =
//     useState("");

//   /* ---------------- FORM ---------------- */

//   const {
//     register,
//     handleSubmit,
//     control,
//     formState: { errors },
//     setValue,
//     reset,
//     watch,
//   } = useForm<FormData>({
//     resolver: yupResolver(
//       registrationSchema as any
//     ),

//     defaultValues: {
//       name: "",
//       email_id: userEmail,
//       gender: "",
//       phone: "",
//       college_id: "",
//       year: "",
//       state: "",
//       city: "",
//       dob:"",
//     },
//   });

//   /* ---------------- COLLEGE API ---------------- */

//   useEffect(() => {
//     axios
//       .get(
//         "https://bits-oasis.org/2026/main/registrations/get_college/"
//       )
//       .then((response) => {
//         console.log(
//           "COLLEGE API RESPONSE:",
//           response.data
//         );

//         setCollegeOptions(
//           response.data.map(
//             (college: {
//               id: number;
//               name: string;
//             }) => ({
//               value: String(college.id),
//               label: college.name,
//             })
//           )
//         );
//       })
//       .catch((error) => {
//         console.error(
//           "COLLEGE API ERROR:",
//           error
//         );

//         console.error(
//           "RESPONSE:",
//           error.response?.data
//         );
//       });
//   }, []);

//   /* ---------------- UPDATE EMAIL ---------------- */

//   useEffect(() => {
//     reset((currentValues) => ({
//       ...currentValues,
//       email_id: userEmail,
//     }));
//   }, [userEmail, reset]);

//   /* ---------------- CITIES ---------------- */

//   const getAvailableCities = (
//     stateName: string
//   ) =>
//     (
//       statesData.find(
//         (item) =>
//           item.state === stateName
//       )?.cities ?? []
//     ).map((city) => ({
//       value: city,
//       label: city,
//     }));

//   useEffect(() => {
//     setAvailableCities(
//       getAvailableCities(selectedState)
//     );
//   }, [selectedState]);

//   /* ---------------- LOCAL STORAGE ---------------- */

//   useEffect(() => {
//     const savedData =
//       localStorage.getItem(
//         "registrationFormData"
//       );

//     if (savedData) {
//       try {
//         const parsedData =
//           JSON.parse(savedData);

//         reset({
//           ...parsedData,
//           email_id: userEmail,
//         });

//         if (parsedData.state) {
//           setSelectedState(
//             parsedData.state
//           );
//         }
//       } catch (err) {
//         console.error(
//           "Failed to parse local storage data:",
//           err
//         );

//         localStorage.removeItem(
//           "registrationFormData"
//         );
//       }
//     }
//   }, [reset, userEmail]);

//   useEffect(() => {
//     const subscription = watch(
//       (value) => {
//         localStorage.setItem(
//           "registrationFormData",
//           JSON.stringify(value)
//         );
//       }
//     );

//     return () =>
//       subscription.unsubscribe();
//   }, [watch]);

//   /* ---------------- STATE SEARCH ---------------- */

//   const getFilteredOptions = (
//     input: string
//   ) => {
//     if (!input) return stateOptions;

//     const inputLower =
//       input.toLowerCase();

//     const startsWith =
//       stateOptions.filter((opt) =>
//         opt.label
//           .toLowerCase()
//           .startsWith(inputLower)
//       );

//     const contains =
//       stateOptions.filter(
//         (opt) =>
//           !opt.label
//             .toLowerCase()
//             .startsWith(inputLower) &&
//           opt.label
//             .toLowerCase()
//             .includes(inputLower)
//       );

//     return [
//       ...startsWith,
//       ...contains,
//     ];
//   };

//   /* ---------------- SELECT STYLES ---------------- */

//   const customStyle = {
//     control: (provided: any) => ({
//       ...provided,
//       outline: "none",
//       border: "none",
//       boxShadow: "none",
//       width: "100%",
//       minHeight: "100%",
//       height: "100%",
//       background: "transparent",
//       cursor: "pointer",
//     }),

//     valueContainer: (
//       provided: any
//     ) => ({
//       ...provided,
//       width: "100%",
//       height: "100%",
//       padding: "0",
//       background: "transparent",
//     }),

//     input: (
//       provided: any
//     ) => ({
//       ...provided,
//       margin: "0",
//       padding: "0",
//       color: "#38170B",
//     }),

//     singleValue: (
//       provided: any
//     ) => ({
//       ...provided,
//       color: "#38170B",
//     }),

//     placeholder: (
//       provided: any
//     ) => ({
//       ...provided,
//       color: "#777",
//     }),

//     indicatorSeparator: () => ({
//       display: "none",
//     }),

//     dropdownIndicator: (
//       provided: any
//     ) => ({
//       ...provided,
//       color: "#38170B",
//     }),

//     menuPortal: (
//       provided: any
//     ) => ({
//       ...provided,
//       zIndex: 9999,
//     }),
//   };

//   /* ---------------- SUBMIT ---------------- */

//   const onSubmit = (
//     data: FormData
//   ) => {
//     console.log(
//       "FORM DATA:",
//       data
//     );

//     const finalData = {
//       ...data,
//       email_id: userEmail,
//     };

//     console.log(
//       "FINAL USER DATA:",
//       finalData
//     );

//     /*
//      * Save registration data.
//      * Registration.tsx receives this through
//      * setUserData and passes it to Events.
//      */
//     setUserData(finalData);

//     /*
//      * This calls:
//      *
//      * Registration.tsx -> toEventPage()
//      * -> setCurrentPage(3)
//      * -> <Events />
//      */
//     onClickNext();

//     localStorage.removeItem(
//       "registrationFormData"
//     );
//   };

//   /* ---------------- UI ---------------- */

//   return (
//     <div
//       className={styles.registerContainer}
//       style={{
//         backgroundImage: `url(${RegBg})`,
//       }}
//     >
//       {/* DECORATIONS */}

//       <img
//         src={leftbottom}
//         className={styles.leftbottom}
//         alt="leftbottom"
//       />

//       <img
//         src={lefttop}
//         className={styles.lefttop}
//         alt="lefttop"
//       />

//       <img
//         src={rightbottom}
//         className={styles.rightbottom}
//         alt="rightbottom"
//       />

//       <img
//         src={righttop}
//         className={styles.righttop}
//         alt="righttop"
//       />

//       {/* BOOK */}

//       <div
//         className={styles.bookContainer}
//         style={{
//           backgroundImage: `url(${book})`,
//         }}
//       >
//         <form
//           className={styles.formContainer}
//           onSubmit={handleSubmit(
//             onSubmit
//           )}
//           autoComplete="off"
//         >
//           {/* LEFT PAGE */}

//           <div
//             className={styles.formLeft}
//           >
//             <h2
//               className={styles.regTitle}
//             >
//               Registration
//             </h2>

//             {/* NAME */}

//             <Reginput
//               title="NAME"
//               registration={register(
//                 "name"
//               )}
//             />

//             {errors.name && (
//               <p
//                 className={
//                   styles.error
//                 }
//               >
//                 {errors.name.message}
//               </p>
//             )}

//             {/* EMAIL */}

//             <Reginput
//               title="EMAIL"
//               registration={register(
//                 "email_id"
//               )}
//               disabled
//               placeholder={userEmail}
             
//             />

//             {errors.email_id && (
//               <p
//                 className={
//                   styles.error
//                 }
//               >
//                 {
//                   errors.email_id
//                     .message
//                 }
//               </p>
//             )}

//             {/* MOBILE */}

//             <Reginput
//               title="MOBILE NUMBER"
//               registration={register(
//                 "phone"
//               )}
//               type="tel"
//             />

//             {errors.phone && (
//               <p
//                 className={
//                   styles.error
//                 }
//               >
//                 {errors.phone.message}
//               </p>
//             )}

//             {/* GENDER */}

//             <Reginput title="GENDER">
//               <Controller
//                 name="gender"
//                 control={control}
//                 render={({
//                   field,
//                 }) => (
//                   <Select<
//                     GenderOption,
//                     false
//                   >
//                     {...field}
//                     options={
//                       genderOptions
//                     }
//                     styles={
//                       customStyle
//                     }
//                     classNamePrefix="regselect"
//                     placeholder="SELECT GENDER"
//                     value={
//                       genderOptions.find(
//                         (option) =>
//                           option.value ===
//                           field.value
//                       ) || null
//                     }
//                     onChange={(
//                       option
//                     ) =>
//                       field.onChange(
//                         option?.value ||
//                           ""
//                       )
//                     }
//                     menuPortalTarget={
//                       document.body
//                     }
//                   />
//                 )}
//               />
//             </Reginput>

//             {errors.gender && (
//               <p
//                 className={
//                   styles.error
//                 }
//               >
//                 {
//                   errors.gender
//                     .message
//                 }
//               </p>
//             )}
//           </div>

//           {/* RIGHT PAGE */}

//           <div
//             className={
//               styles.formRight
//             }
//           >
//             {/* COLLEGE */}
// {/* DOB */}

// <Reginput
//   title="DATE OF BIRTH"
//   type="date"
//   registration={register("dob")}
// />

// {errors.dob && (
//   <p className={styles.error}>
//     {errors.dob.message}
//   </p>
// )}


//             <Reginput title="COLLEGE NAME">
//               <Controller
//                 name="college_id"
//                 control={control}
//                 render={({
//                   field,
//                 }) => (
//                   <Select
//                     {...field}
//                     options={
//                       collegeOptions
//                     }
//                     styles={
//                       customStyle
//                     }
//                     classNamePrefix="regselect"
//                     placeholder="SELECT COLLEGE"
//                     value={
//                       collegeOptions.find(
//                         (college) =>
//                           college.value ===
//                           field.value
//                       ) || null
//                     }
//                     onChange={(
//                       option
//                     ) =>
//                       field.onChange(
//                         option?.value ||
//                           ""
//                       )
//                     }
//                     menuPortalTarget={
//                       document.body
//                     }
//                   />
//                 )}
//               />
//             </Reginput>

//             {errors.college_id && (
//               <p
//                 className={
//                   styles.error
//                 }
//               >
//                 {
//                   errors.college_id
//                     .message
//                 }
//               </p>
//             )}

//             {/* YEAR */}

//             <Reginput title="YEAR OF STUDY">
//               <div
//                 className={
//                   styles.yearOptions
//                 }
//               >
//                 {[
//                   "1",
//                   "2",
//                   "3",
//                   "4",
//                   "5",
//                 ].map((year) => (
//                   <label key={year}>
//                     <input
//                       type="radio"
//                       value={year}
//                       {...register(
//                         "year"
//                       )}
//                     />
//                     <span>
//                       {year}
//                     </span>
//                   </label>
//                 ))}
//               </div>
//             </Reginput>

//             {errors.year && (
//               <p
//                 className={
//                   styles.error
//                 }
//               >
//                 {
//                   errors.year.message
//                 }
//               </p>
//             )}

//             {/* STATE */}

//             <Reginput title="STATE">
//               <Controller
//                 name="state"
//                 control={control}
//                 render={({
//                   field,
//                 }) => (
//                   <Select
//                     {...field}
//                     options={getFilteredOptions(
//                       inputValue
//                     )}
//                     styles={
//                       customStyle
//                     }
//                     classNamePrefix="regselect"
//                     placeholder="SELECT STATE"
//                     value={
//                       stateOptions.find(
//                         (state) =>
//                           state.value ===
//                           field.value
//                       ) || null
//                     }
//                     onInputChange={(
//                       value
//                     ) =>
//                       setInputValue(
//                         value
//                       )
//                     }
//                     filterOption={() =>
//                       true
//                     }
//                     onChange={(
//                       option
//                     ) => {
//                       const value =
//                         option?.value ||
//                         "";

//                       field.onChange(
//                         value
//                       );

//                       setSelectedState(
//                         value
//                       );

//                       setValue(
//                         "city",
//                         ""
//                       );
//                     }}
//                     menuPortalTarget={
//                       document.body
//                     }
//                   />
//                 )}
//               />
//             </Reginput>

//             {errors.state && (
//               <p
//                 className={
//                   styles.error
//                 }
//               >
//                 {
//                   errors.state
//                     .message
//                 }
//               </p>
//             )}

//             {/* CITY */}

//             <Reginput title="CITY">
//               <Controller
//                 name="city"
//                 control={control}
//                 render={({
//                   field,
//                 }) => (
//                   <Select
//                     {...field}
//                     options={
//                       availableCities
//                     }
//                     styles={
//                       customStyle
//                     }
//                     classNamePrefix="regselect"
//                     placeholder="SELECT CITY"
//                     isDisabled={
//                       !selectedState
//                     }
//                     value={
//                       availableCities.find(
//                         (city) =>
//                           city.value ===
//                           field.value
//                       ) || null
//                     }
//                     onChange={(
//                       option
//                     ) =>
//                       field.onChange(
//                         option?.value ||
//                           ""
//                       )
//                     }
//                     menuPortalTarget={
//                       document.body
//                     }
//                   />
//                 )}
//               />
//             </Reginput>

//             {errors.city && (
//               <p
//                 className={
//                   styles.error
//                 }
//               >
//                 {errors.city.message}
//               </p>
//             )}

//             {/* NEXT */}

//             <button
//               type="submit"
//               style={{
//           backgroundImage: `url(${buttonBg})`,
//         }}
//               className={
//                 styles.nextButton
//               }
//             >
//               NEXT
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Select from "react-select";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";

import styles from "./Register.module.scss";
import Reginput from "./reginput";

import RegBg from "../../../../assets/registration/reg/RegBg.png";
import leftbottom from "../../../../assets/registration/reg/leftbottom.png";
import rightbottom from "../../../../assets/registration/reg/rightbottom.png";
import lefttop from "../../../../assets/registration/reg/lefttop.png";
import righttop from "../../../../assets/registration/reg/righttop.png";
import book from "../../../../assets/registration/reg/book.png";
import buttonBg from "../../../../assets/registration/reg/buttonbg.png";

import statesData from "./cities.json";

interface RegProps {
  onClickNext: () => void;
  userEmail: string;
  setUserData: React.Dispatch<React.SetStateAction<any>>;
}

/* ---------------- VALIDATION ---------------- */

const registrationSchema = yup.object({
  name: yup
    .string()
    .required("Name is required"),

  email_id: yup
    .string()
    .email("Invalid email"),

  gender: yup
    .string()
    .required("Gender is required"),

  phone: yup
    .string()
    .matches(
      /^[1-9]\d{9}$/,
      "Invalid number"
    )
    .required("Mobile number is required"),

  college_id: yup
    .string()
    .required("College is required"),

  year: yup
    .string()
    .required("Field is required"),

  state: yup
    .string()
    .required("State is required"),

  city: yup
    .string()
    .required("City is required"),
    dob: yup
  .string()
  .required("Date of birth is required"),
});

type FormData = yup.InferType<
  typeof registrationSchema
>;

/* ---------------- OPTIONS ---------------- */

type GenderOption = {
  value: "M" | "F" | "O";
  label: string;
};

const genderOptions: GenderOption[] = [
  {
    value: "M",
    label: "Male",
  },
  {
    value: "F",
    label: "Female",
  },
  {
    value: "O",
    label: "Other",
  },
];

const stateOptions = statesData.map(
  (item) => ({
    value: item.state,
    label: item.state,
  })
);

/* ---------------- COMPONENT ---------------- */

export default function Reg({
  onClickNext,
  userEmail,
  setUserData,
}: RegProps) {
  const [selectedState, setSelectedState] =
    useState("");

  const [
    availableCities,
    setAvailableCities,
  ] = useState<
    { value: string; label: string }[]
  >([]);

  const [
    collegeOptions,
    setCollegeOptions,
  ] = useState<
    { value: string; label: string }[]
  >([]);

  const [inputValue, setInputValue] =
    useState("");

  /* ---------------- FORM ---------------- */

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(
      registrationSchema as any
    ),

    defaultValues: {
      name: "",
      email_id: userEmail,
      gender: "",
      phone: "",
      college_id: "",
      year: "",
      state: "",
      city: "",
      dob:"",
    },
  });

  /* ---------------- COLLEGE API ---------------- */

  useEffect(() => {
    axios
      .get(
        "https://bits-oasis.org/2026/main/registrations/get_college/"
      )
      .then((response) => {
        console.log(
          "COLLEGE API RESPONSE:",
          response.data
        );

        setCollegeOptions(
          response.data.map(
            (college: {
              id: number;
              name: string;
            }) => ({
              value: String(college.id),
              label: college.name,
            })
          )
        );
      })
      .catch((error) => {
        console.error(
          "COLLEGE API ERROR:",
          error
        );

        console.error(
          "RESPONSE:",
          error.response?.data
        );
      });
  }, []);

  /* ---------------- UPDATE EMAIL ---------------- */

  useEffect(() => {
    reset((currentValues) => ({
      ...currentValues,
      email_id: userEmail,
    }));
  }, [userEmail, reset]);

  /* ---------------- CITIES ---------------- */

  const getAvailableCities = (
    stateName: string
  ) =>
    (
      statesData.find(
        (item) =>
          item.state === stateName
      )?.cities ?? []
    ).map((city) => ({
      value: city,
      label: city,
    }));

  useEffect(() => {
    setAvailableCities(
      getAvailableCities(selectedState)
    );
  }, [selectedState]);

  /* ---------------- LOCAL STORAGE ---------------- */

  useEffect(() => {
    const savedData =
      localStorage.getItem(
        "registrationFormData"
      );

    if (savedData) {
      try {
        const parsedData =
          JSON.parse(savedData);

        reset({
          ...parsedData,
          email_id: userEmail,
        });

        if (parsedData.state) {
          setSelectedState(
            parsedData.state
          );
        }
      } catch (err) {
        console.error(
          "Failed to parse local storage data:",
          err
        );

        localStorage.removeItem(
          "registrationFormData"
        );
      }
    }
  }, [reset, userEmail]);

  useEffect(() => {
    const subscription = watch(
      (value) => {
        localStorage.setItem(
          "registrationFormData",
          JSON.stringify(value)
        );
      }
    );

    return () =>
      subscription.unsubscribe();
  }, [watch]);

  /* ---------------- STATE SEARCH ---------------- */

  const getFilteredOptions = (
    input: string
  ) => {
    if (!input) return stateOptions;

    const inputLower =
      input.toLowerCase();

    const startsWith =
      stateOptions.filter((opt) =>
        opt.label
          .toLowerCase()
          .startsWith(inputLower)
      );

    const contains =
      stateOptions.filter(
        (opt) =>
          !opt.label
            .toLowerCase()
            .startsWith(inputLower) &&
          opt.label
            .toLowerCase()
            .includes(inputLower)
      );

    return [
      ...startsWith,
      ...contains,
    ];
  };

  /* ---------------- SELECT STYLES ---------------- */

  const customStyle = {
    control: (provided: any) => ({
      ...provided,
      outline: "none",
      border: "none",
      boxShadow: "none",
      width: "100%",
      minHeight: "100%",
      height: "100%",
      background: "transparent",
      cursor: "pointer",
    }),

    valueContainer: (
      provided: any
    ) => ({
      ...provided,
      width: "100%",
      height: "100%",
      padding: "0",
      background: "transparent",
    }),

    input: (
      provided: any
    ) => ({
      ...provided,
      margin: "0",
      padding: "0",
      color: "#38170B",
    }),

    singleValue: (
      provided: any
    ) => ({
      ...provided,
      color: "#38170B",
    }),

    placeholder: (
      provided: any
    ) => ({
      ...provided,
      color: "#6C1700",
    }),

    indicatorSeparator: () => ({
      display: "none",
    }),

    dropdownIndicator: (
      provided: any
    ) => ({
      ...provided,
      color: "#38170B",
    }),

    menuPortal: (
      provided: any
    ) => ({
      ...provided,
      zIndex: 9999,
    }),

    menu: (
      provided: any
    ) => ({
      ...provided,
      marginTop: 4,
    }),

    menuList: (
      provided: any
    ) => ({
      ...provided,
      maxHeight: 260,
      padding: 4,
    }),
  };

  /* ---------------- SUBMIT ---------------- */

  const onSubmit = (
    data: FormData
  ) => {
    console.log(
      "FORM DATA:",
      data
    );

    const finalData = {
      ...data,
      email_id: userEmail,
    };

    console.log(
      "FINAL USER DATA:",
      finalData
    );

    /*
     * Save registration data.
     * Registration.tsx receives this through
     * setUserData and passes it to Events.
     */
    setUserData(finalData);

    /*
     * This calls:
     *
     * Registration.tsx -> toEventPage()
     * -> setCurrentPage(3)
     * -> <Events />
     */
    onClickNext();

    localStorage.removeItem(
      "registrationFormData"
    );
  };

  /* ---------------- UI ---------------- */

  return (
    <div
      className={styles.registerContainer}
      style={{
        backgroundImage: `url(${RegBg})`,
      }}
    >
      {/* DECORATIONS */}

      <img
        src={leftbottom}
        className={styles.leftbottom}
        alt="leftbottom"
      />

      <img
        src={lefttop}
        className={styles.lefttop}
        alt="lefttop"
      />

      <img
        src={rightbottom}
        className={styles.rightbottom}
        alt="rightbottom"
      />

      <img
        src={righttop}
        className={styles.righttop}
        alt="righttop"
      />

      {/* BOOK */}

      <div
        className={styles.bookContainer}
        style={{
          backgroundImage: `url(${book})`,
        }}
      >
        <form
          className={styles.formContainer}
          onSubmit={handleSubmit(
            onSubmit
          )}
          autoComplete="off"
        >
          {/* LEFT PAGE */}

          <div
            className={styles.formLeft}
          >
            <h2
              className={styles.regTitle}
            >
              Registration
            </h2>

            {/* NAME */}

            <Reginput
              title="NAME"
              registration={register(
                "name"
              )}
            />

            {errors.name && (
              <p
                className={
                  styles.error
                }
              >
                {errors.name.message}
              </p>
            )}

            {/* EMAIL */}

            <Reginput
              title="EMAIL"
              registration={register(
                "email_id"
              )}
              disabled
              placeholder={userEmail}
             
            />

            {errors.email_id && (
              <p
                className={
                  styles.error
                }
              >
                {
                  errors.email_id
                    .message
                }
              </p>
            )}

            {/* MOBILE */}

            <Reginput
              title="MOBILE NUMBER"
              registration={register(
                "phone"
              )}
              type="tel"
            />

            {errors.phone && (
              <p
                className={
                  styles.error
                }
              >
                {errors.phone.message}
              </p>
            )}

            {/* GENDER */}

            <Reginput title="GENDER">
              <Controller
                name="gender"
                control={control}
                render={({
                  field,
                }) => (
                  <Select<
                    GenderOption,
                    false
                  >
                    {...field}
                    options={
                      genderOptions
                    }
                    styles={
                      customStyle
                    }
                    classNamePrefix="regselect"
                    placeholder="SELECT GENDER"
                      menuPlacement="top"
                    value={
                      genderOptions.find(
                        (option) =>
                          option.value ===
                          field.value
                      ) || null
                    }
                    onChange={(
                      option
                    ) =>
                      field.onChange(
                        option?.value ||
                          ""
                      )
                    }
                    menuPortalTarget={
                      document.body
                    }
                  />
                )}
              />
            </Reginput>

            {errors.gender && (
              <p
                className={
                  styles.error
                }
              >
                {
                  errors.gender
                    .message
                }
              </p>
            )}
          </div>

          {/* RIGHT PAGE */}

          <div
            className={
              styles.formRight
            }
          >
            {/* COLLEGE */}
{/* DOB */}

<Reginput
  title="DATE OF BIRTH"
  type="date"
  registration={register("dob")}
/>

{errors.dob && (
  <p className={styles.error}>
    {errors.dob.message}
  </p>
)}


            <Reginput title="COLLEGE NAME">
              <Controller
                name="college_id"
                control={control}
                render={({
                  field,
                }) => (
                  <Select
                    {...field}
                    options={
                      collegeOptions
                    }
                    styles={
                      customStyle
                    }
                    classNamePrefix="regselect"
                    placeholder="SELECT COLLEGE"
                    value={
                      collegeOptions.find(
                        (college) =>
                          college.value ===
                          field.value
                      ) || null
                    }
                    onChange={(
                      option
                    ) =>
                      field.onChange(
                        option?.value ||
                          ""
                      )
                    }
                    menuPortalTarget={
                      document.body
                    }
                  />
                )}
              />
            </Reginput>

            {errors.college_id && (
              <p
                className={
                  styles.error
                }
              >
                {
                  errors.college_id
                    .message
                }
              </p>
            )}

            {/* YEAR */}

            <Reginput title="YEAR OF STUDY">
              <div
                className={
                  styles.yearOptions
                }
              >
                {[
                  "1",
                  "2",
                  "3",
                  "4",
                  "5",
                ].map((year) => (
                  <label key={year}>
                    <input
                      type="radio"
                      value={year}
                      {...register(
                        "year"
                      )}
                    />
                    <span>
                      {year}
                    </span>
                  </label>
                ))}
              </div>
            </Reginput>

            {errors.year && (
              <p
                className={
                  styles.error
                }
              >
                {
                  errors.year.message
                }
              </p>
            )}

            {/* STATE */}

            <Reginput title="STATE">
              <Controller
                name="state"
                control={control}
                render={({
                  field,
                }) => (
                  <Select
                    {...field}
                    options={getFilteredOptions(
                      inputValue
                    )}
                    styles={
                      customStyle
                    }
                    classNamePrefix="regselect"
                    placeholder="SELECT STATE"
                    value={
                      stateOptions.find(
                        (state) =>
                          state.value ===
                          field.value
                      ) || null
                    }
                    onInputChange={(
                      value
                    ) =>
                      setInputValue(
                        value
                      )
                    }
                    filterOption={() =>
                      true
                    }
                    onChange={(
                      option
                    ) => {
                      const value =
                        option?.value ||
                        "";

                      field.onChange(
                        value
                      );

                      setSelectedState(
                        value
                      );

                      setValue(
                        "city",
                        ""
                      );
                    }}
                    menuPortalTarget={
                      document.body
                    }
                  />
                )}
              />
            </Reginput>

            {errors.state && (
              <p
                className={
                  styles.error
                }
              >
                {
                  errors.state
                    .message
                }
              </p>
            )}

            {/* CITY */}

            <Reginput title="CITY">
              <Controller
                name="city"
                control={control}
                render={({
                  field,
                }) => (
                  <Select
                    {...field}
                    options={
                      availableCities
                    }
                    styles={
                      customStyle
                    }
                    menuPlacement="top"
                    classNamePrefix="regselect"
                    placeholder="SELECT CITY"
                    isDisabled={
                      !selectedState
                    }
                    value={
                      availableCities.find(
                        (city) =>
                          city.value ===
                          field.value
                      ) || null
                    }
                    onChange={(
                      option
                    ) =>
                      field.onChange(
                        option?.value ||
                          ""
                      )
                    }
                    menuPortalTarget={
                      document.body
                    }
                  />
                )}
              />
            </Reginput>

            {errors.city && (
              <p
                className={
                  styles.error
                }
              >
                {errors.city.message}
              </p>
            )}

            {/* NEXT */}

            <button
              type="submit"
              style={{
          backgroundImage: `url(${buttonBg})`,
        }}
              className={
                styles.nextButton
              }
            >
              NEXT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}