// import styles from "./reg.module.scss";
// import Reginput from "./Reginput";
// import RegBg from "../../../assets/registration/reg/RegBg.png";
// import leftbottom from "../../../assets/registration/reg/leftbottom.png";
// import rightbottom from "../../../assets/registration/reg/rightbottom.png";
// import lefttop from "../../../assets/registration/reg/lefttop.png";
// import righttop from "../../../assets/registration/reg/righttop.png";
// import book from "../../../assets/registration/reg/book.png";
// export default function Reg() {
//   return (
//     <div
//       className={styles.registerContainer}
//       style={{ backgroundImage: `url(${RegBg})` }}
//     >
//       <img src={leftbottom} className={styles.leftbottom} alt="leftbottom" />
//       <img src={lefttop} className={styles.lefttop} alt="lefttop" />
//       <img src={rightbottom} className={styles.rightbottom} alt="rightbottom" />
//       <img src={righttop} className={styles.righttop} alt="righttop" />
//       <div
//         className={styles.bookContainer}
//         style={{ backgroundImage: `url(${book})` }}
//       >
//         <form action=""className={styles.formContainer}>
          
//             <div className={styles.formLeft}>
//             <h2 className={styles.regTitle}>Registration</h2>

//             </div>
//             <div className={styles.formRight}>

//             </div>
        
//         </form>
//       </div>
//     </div>
//   );
// }



// import { useEffect, useState } from "react";
// import { useForm, Controller } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import Select from "react-select";

// import styles from "./reg.module.scss";
// import Reginput from "./Reginput";

// import RegBg from "../../../assets/registration/reg/RegBg.png";
// import leftbottom from "../../../assets/registration/reg/leftbottom.png";
// import rightbottom from "../../../assets/registration/reg/rightbottom.png";
// import lefttop from "../../../assets/registration/reg/lefttop.png";
// import righttop from "../../../assets/registration/reg/righttop.png";
// import book from "../../../assets/registration/reg/book.png";

// import axios from "axios";
// import statesData from "./Register/cities.json";

// interface RegProps {
//   onClickNext: () => void;
//   userEmail: string;
//   setUserData: React.Dispatch<React.SetStateAction<any>>;
// }

// const registrationSchema = yup.object({
//   name: yup.string().required("Name is required"),

//   email_id: yup.string().email("Invalid email"),

//   gender: yup.string().required("Gender is required"),

//   phone: yup
//     .string()
//     .matches(/^[1-9]\d{9}$/, "Invalid number")
//     .required("Mobile number is required"),

//   college_id: yup.string().required("College is required"),

//   year: yup.string().required("Field is required"),

//   state: yup.string().required("State is required"),

//   city: yup.string().required("City is required"),
// });

// type FormData = yup.InferType<typeof registrationSchema>;

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

// const stateOptions = statesData.map((item) => ({
//   value: item.state,
//   label: item.state,
// }));

// export default function Reg({
//   onClickNext,
//   userEmail,
//   setUserData,
// }: RegProps) {
//   const [selectedState, setSelectedState] = useState("");

//   const [availableCities, setAvailableCities] = useState<
//     { value: string; label: string }[]
//   >([]);

//   const [collegeOptions, setCollegeOptions] = useState<
//     { value: string; label: string }[]
//   >([]);

//   const {
//     register,
//     handleSubmit,
//     control,
//     formState: { errors },
//     reset,
//     setValue,
//   } = useForm<FormData>({
//     resolver: yupResolver(registrationSchema as any),

//     defaultValues: {
//       name: "",
//       email_id: userEmail,
//       gender: "",
//       phone: "",
//       college_id: "",
//       year: "",
//       state: "",
//       city: "",
//     },
//   });

//   // -----------------------------------------
//   // FETCH COLLEGES
//   // -----------------------------------------

//   useEffect(() => {
//     axios
//       .get(
//         "https://bits-oasis.org/2026/main/registrations/get_college/"
//       )
//       .then((response) => {
//         console.log("COLLEGE API RESPONSE:", response.data);

//         setCollegeOptions(
//           response.data.map(
//             (college: { id: number; name: string }) => ({
//               value: String(college.id),
//               label: college.name,
//             })
//           )
//         );
//       })
//       .catch((error) => {
//         console.error("COLLEGE API ERROR:", error);
//         console.error("RESPONSE:", error.response?.data);
//       });
//   }, []);

//   // -----------------------------------------
//   // UPDATE EMAIL WHEN GOOGLE LOGIN CHANGES
//   // -----------------------------------------

//   useEffect(() => {
//     reset((currentValues) => ({
//       ...currentValues,
//       email_id: userEmail,
//     }));
//   }, [userEmail, reset]);

//   // -----------------------------------------
//   // CITIES
//   // -----------------------------------------

//   const getAvailableCities = (stateName: string) =>
//     (
//       statesData.find(
//         (item) => item.state === stateName
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

//   // -----------------------------------------
//   // SUBMIT
//   // -----------------------------------------

//   const onSubmit = (data: FormData) => {
//     console.log("FORM DATA:", data);

//     const finalData = {
//       ...data,
//       email_id: userEmail,
//     };

//     console.log("FINAL USER DATA:", finalData);

//     setUserData(finalData);

//     onClickNext();
//   };

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

//       <div
//         className={styles.bookContainer}
//         style={{
//           backgroundImage: `url(${book})`,
//         }}
//       >
//         <form
//           className={styles.formContainer}
//           onSubmit={handleSubmit(onSubmit)}
//           autoComplete="off"
//         >
//           {/* -------------------------------- */}
//           {/* LEFT SIDE */}
//           {/* -------------------------------- */}

//           <div className={styles.formLeft}>
//             <h2 className={styles.regTitle}>
//               Registration
//             </h2>

//             {/* NAME */}

//             <Reginput
//               title="NAME"
//               registration={register("name")}
//             />

//             {errors.name && (
//               <p className={styles.error}>
//                 {errors.name.message}
//               </p>
//             )}

//             {/* EMAIL */}

//             <Reginput
//               title="EMAIL"
//               registration={register("email_id")}
//               disabled
//               placeholder={userEmail}
//             />

//             {errors.email_id && (
//               <p className={styles.error}>
//                 {errors.email_id.message}
//               </p>
//             )}

//             {/* PHONE */}

//             <Reginput
//               title="MOBILE NUMBER"
//               registration={register("phone")}
//               type="tel"
//             />

//             {errors.phone && (
//               <p className={styles.error}>
//                 {errors.phone.message}
//               </p>
//             )}

//             {/* GENDER */}

//             <div className={styles.selectContainer}>
//               <h2>GENDER</h2>

//               <Controller
//                 name="gender"
//                 control={control}
//                 render={({ field }) => (
//                   <Select
//                     {...field}
//                     options={genderOptions}
//                     placeholder="SELECT GENDER"
//                     value={
//                       genderOptions.find(
//                         (option) =>
//                           option.value === field.value
//                       ) || null
//                     }
//                     onChange={(option) =>
//                       field.onChange(
//                         option?.value || ""
//                       )
//                     }
//                   />
//                 )}
//               />
//             </div>

//             {errors.gender && (
//               <p className={styles.error}>
//                 {errors.gender.message}
//               </p>
//             )}
//           </div>

//           {/* -------------------------------- */}
//           {/* RIGHT SIDE */}
//           {/* -------------------------------- */}

//           <div className={styles.formRight}>

//             {/* COLLEGE */}

//             <div className={styles.selectContainer}>
//               <h2>COLLEGE NAME</h2>

//               <Controller
//                 name="college_id"
//                 control={control}
//                 render={({ field }) => (
//                   <Select
//                     {...field}
//                     options={collegeOptions}
//                     placeholder="SELECT COLLEGE"
//                     value={
//                       collegeOptions.find(
//                         (college) =>
//                           college.value === field.value
//                       ) || null
//                     }
//                     onChange={(option) =>
//                       field.onChange(
//                         option?.value || ""
//                       )
//                     }
//                   />
//                 )}
//               />
//             </div>

//             {errors.college_id && (
//               <p className={styles.error}>
//                 {errors.college_id.message}
//               </p>
//             )}

//             {/* YEAR */}

//             <div className={styles.yearContainer}>
//               <h2>YEAR OF STUDY</h2>

//               <div className={styles.yearOptions}>
//                 {["1", "2", "3", "4", "5"].map(
//                   (year) => (
//                     <label key={year}>
//                       <input
//                         type="radio"
//                         value={year}
//                         {...register("year")}
//                       />

//                       <span>{year}</span>
//                     </label>
//                   )
//                 )}
//               </div>
//             </div>

//             {errors.year && (
//               <p className={styles.error}>
//                 {errors.year.message}
//               </p>
//             )}

//             {/* STATE */}

//             <div className={styles.selectContainer}>
//               <h2>STATE</h2>

//               <Controller
//                 name="state"
//                 control={control}
//                 render={({ field }) => (
//                   <Select
//                     {...field}
//                     options={stateOptions}
//                     placeholder="SELECT STATE"
//                     value={
//                       stateOptions.find(
//                         (state) =>
//                           state.value === field.value
//                       ) || null
//                     }
//                     onChange={(option) => {
//                       const value =
//                         option?.value || "";

//                       field.onChange(value);

//                       setSelectedState(value);

//                       setValue("city", "");
//                     }}
//                   />
//                 )}
//               />
//             </div>

//             {errors.state && (
//               <p className={styles.error}>
//                 {errors.state.message}
//               </p>
//             )}

//             {/* CITY */}

//             <div className={styles.selectContainer}>
//               <h2>CITY</h2>

//               <Controller
//                 name="city"
//                 control={control}
//                 render={({ field }) => (
//                   <Select
//                     {...field}
//                     options={availableCities}
//                     placeholder="SELECT CITY"
//                     isDisabled={!selectedState}
//                     value={
//                       availableCities.find(
//                         (city) =>
//                           city.value === field.value
//                       ) || null
//                     }
//                     onChange={(option) =>
//                       field.onChange(
//                         option?.value || ""
//                       )
//                     }
//                   />
//                 )}
//               />
//             </div>

//             {errors.city && (
//               <p className={styles.error}>
//                 {errors.city.message}
//               </p>
//             )}

//             {/* SUBMIT */}

//             <button
//               type="submit"
//               className={styles.nextButton}
//             >
//               NEXT
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Select from "react-select";
import axios from "axios";

import styles from "./reg.module.scss";
import Reginput from "./reginput.tsx";

import RegBg from "../../../assets/registration/reg/RegBg.png";
import leftbottom from "../../../assets/registration/reg/leftbottom.png";
import rightbottom from "../../../assets/registration/reg/rightbottom.png";
import lefttop from "../../../assets/registration/reg/lefttop.png";
import righttop from "../../../assets/registration/reg/righttop.png";
import book from "../../../assets/registration/reg/book.png";

import statesData from "./Register/cities.json";

interface RegProps {
  onClickNext: () => void;
  userEmail: string;
  setUserData: React.Dispatch<React.SetStateAction<any>>;
}

const registrationSchema = yup.object({
  name: yup.string().required("Name is required"),

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
});

type FormData = yup.InferType<
  typeof registrationSchema
>;

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

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
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
    },
  });

  // -----------------------------------------
  // GET COLLEGES
  // -----------------------------------------

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

  // -----------------------------------------
  // SET EMAIL FROM GOOGLE LOGIN
  // -----------------------------------------

  useEffect(() => {
    reset((currentValues) => ({
      ...currentValues,
      email_id: userEmail,
    }));
  }, [userEmail, reset]);

  // -----------------------------------------
  // GET CITIES
  // -----------------------------------------

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

  // -----------------------------------------
  // SUBMIT
  // -----------------------------------------

  const onSubmit = (data: FormData) => {
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

    setUserData(finalData);

    onClickNext();
  };

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
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="off"
        >
          {/* ================================= */}
          {/* LEFT PAGE */}
          {/* ================================= */}

          <div className={styles.formLeft}>
            <h2 className={styles.regTitle}>
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
              <p className={styles.error}>
                {errors.name.message}
              </p>
            )}

            {/* EMAIL */}

            <Reginput
              title="EMAIL"
              registration={register(
                "email_id"
              )}
              disabled={true}
              placeholder={userEmail}
            />

            {errors.email_id && (
              <p className={styles.error}>
                {errors.email_id.message}
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
              <p className={styles.error}>
                {errors.phone.message}
              </p>
            )}

            {/* GENDER */}

            <Reginput title="GENDER">
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={
                      genderOptions
                    }
                      classNamePrefix="regselect"
                    placeholder="SELECT GENDER"
                    value={
                      genderOptions.find(
                        (option) =>
                          option.value ===
                          field.value
                      ) || null
                    }
                    onChange={(option) =>
                      field.onChange(
                        option?.value ||
                          ""
                      )
                    }
                  />
                )}
              />
            </Reginput>

            {errors.gender && (
              <p className={styles.error}>
                {errors.gender.message}
              </p>
            )}
          </div>

          {/* ================================= */}
          {/* RIGHT PAGE */}
          {/* ================================= */}

          <div className={styles.formRight}>

            {/* COLLEGE */}

            <Reginput title="COLLEGE NAME">
              <Controller
                name="college_id"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={
                      collegeOptions
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
                    onChange={(option) =>
                      field.onChange(
                        option?.value ||
                          ""
                      )
                    }
                  />
                )}
              />
            </Reginput>

            {errors.college_id && (
              <p className={styles.error}>
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
              <p className={styles.error}>
                {errors.year.message}
              </p>
            )}

            {/* STATE */}

            <Reginput title="STATE">
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={
                      stateOptions
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
                    onChange={(option) => {
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
                  />
                )}
              />
            </Reginput>

            {errors.state && (
              <p className={styles.error}>
                {errors.state.message}
              </p>
            )}

            {/* CITY */}

            <Reginput title="CITY">
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={
                      availableCities
                    }
                    
                    placeholder="SELECT CITY"
                    isDisabled={
                      !selectedState
                    }
                      classNamePrefix="regselect"
                    value={
                      availableCities.find(
                        (city) =>
                          city.value ===
                          field.value
                      ) || null
                    }
                    onChange={(option) =>
                      field.onChange(
                        option?.value ||
                          ""
                      )
                    }
                  />
                )}
              />
            </Reginput>

            {errors.city && (
              <p className={styles.error}>
                {errors.city.message}
              </p>
            )}

            {/* NEXT */}

            <button
              type="submit"
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