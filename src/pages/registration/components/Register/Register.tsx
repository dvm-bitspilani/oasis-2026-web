import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Select from "react-select";
import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Link } from "react-router-dom";
import { sampleIdentity, demoColleges, registrationSchema } from "../../../../demoService";

import styles from "./Register.module.scss";
import Reginput from "./reginput";

const RegBg =
  new URL("../../../../assets/registration/reg/RegBg.png", import.meta.url).href;

const leftbottom =
  new URL("../../../../assets/registration/reg/leftbottom.png", import.meta.url).href;

const rightbottom =
  new URL("../../../../assets/registration/reg/rightbottom.png", import.meta.url).href;

const lefttop =
  new URL("../../../../assets/registration/reg/lefttop.png", import.meta.url).href;

const leftmiddle =
  new URL("../../../../assets/registration/reg/leftmiddle.png", import.meta.url).href;

const rightmid =
  new URL("../../../../assets/registration/reg/rightmid.png", import.meta.url).href;

const righttop =
  new URL("../../../../assets/registration/reg/righttop.png", import.meta.url).href;

const book =
  new URL("../../../../assets/registration/reg/book.png", import.meta.url).href;

const buttonBg =
  new URL("../../../../assets/registration/reg/buttonbg.png", import.meta.url).href;

const tajmahal =
  new URL("../../../../assets/registration/reg/tajMahal.png", import.meta.url).href;

const backBtn =
  new URL("../../../../assets/registration/reg/regBackButton.webp", import.meta.url).href;
import statesData from "./cities.json";

interface RegProps {
  onClickNext: () => void;
  userEmail: string;

  /*
   * Previously submitted values, held by the parent. When the user comes
   * back from the Events screen this is used to repopulate the form and
   * is restored from the parent in-memory state.
   */
  userData?: any;

  setUserData: React.Dispatch<React.SetStateAction<any>>;
}

/* ========================================================= */
/* VALIDATION                                                 */
/* ========================================================= */


type FormData = yup.InferType<typeof registrationSchema>;

/* ========================================================= */
/* GENDER                                                     */
/* ========================================================= */

type GenderOption = {
  value: "M" | "F" | "O";
  label: string;
};

const genderOptions: GenderOption[] = [
  {
    value: "F",
    label: "Female",
  },
  {
    value: "M",
    label: "Male",
  },
  {
    value: "O",
    label: "Others",
  },
];

/* ========================================================= */
/* STATE                                                      */
/* ========================================================= */

const stateOptions = statesData.map((item) => ({
  value: item.state,
  label: item.state,
}));

/* ========================================================= */
/* DOB OPTIONS                                                */
/* ========================================================= */

const days = Array.from({ length: 31 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
);

const months = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const currentYear = new Date().getFullYear();

const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

/* ========================================================= */
/* MOBILE                                                     */
/* ========================================================= */

const MOBILE_BREAKPOINT = 900;

/* ========================================================= */
/* COMPONENT                                                   */
/* ========================================================= */

export default function Reg({
  onClickNext,
  userEmail,
  userData,
  setUserData,
}: RegProps) {
  const [isMobile, setIsMobile] = useState<boolean>(
    () =>
      typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ======================================================= */
  /* STATE                                                    */
  /* ======================================================= */

  const [selectedState, setSelectedState] = useState("");

  const [availableCities, setAvailableCities] = useState<
    { value: string; label: string }[]
  >([]);

  const [collegeOptions, setCollegeOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const [inputValue, setInputValue] = useState("");

  // Keep DOB selectors independently so selecting one does not
  // reset the others before all three values have been chosen.
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");

  /* ======================================================= */
  /* FORM                                                     */
  /* ======================================================= */

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(registrationSchema as any),

    defaultValues: { ...sampleIdentity, email_id: userEmail },
  });

  /* ======================================================= */
  /* COLLEGE API                                              */
  /* ======================================================= */

  useEffect(() => { setCollegeOptions(demoColleges); }, []);

  /* ======================================================= */
  /* EMAIL                                                     */
  /* ======================================================= */

  useEffect(() => {
    reset((currentValues) => ({
      ...currentValues,
      email_id: userEmail,
    }));
  }, [userEmail, reset]);

  /* ======================================================= */
  /* CITIES                                                    */
  /* ======================================================= */

  const getAvailableCities = (stateName: string) => {
    return (
      statesData.find((item) => item.state === stateName)?.cities ?? []
    ).map((city) => ({
      value: city,
      label: city,
    }));
  };

  useEffect(() => {
    setAvailableCities(getAvailableCities(selectedState));
  }, [selectedState]);

  /* ======================================================= */
  /* LOCAL STORAGE                                             */
  /* ======================================================= */

  // Guards against the restore running twice. `userData` is a dependency
  // below, so without this a parent re-render could reset() the form and
  // discard edits the user made after coming back from Events.
  const hasRestored = useRef(false);

  useEffect(() => {
    if (hasRestored.current) return;

    // Prefer the values held by the parent — they survive even if
    // the draft remains only in the parent component.
    let source = userData;


    if (!source) return;

    hasRestored.current = true;

    // `events` is added on the Events screen and is not part of this
    // form's schema, so it is dropped before repopulating.
    const { events, ...formValues } = source;

    reset({
      ...formValues,
      email_id: userEmail,
    });

    if (formValues.state) {
      setSelectedState(formValues.state);
    }

    if (formValues.dob) {
      const [year, month, day] = String(formValues.dob).split("-");

      setDobYear(year || "");
      setDobMonth(month || "");
      setDobDay(day || "");
    }
  }, [reset, userEmail, userData]);


  /* ======================================================= */
  /* STATE SEARCH                                              */
  /* ======================================================= */

  const getFilteredOptions = (input: string) => {
    if (!input) {
      return stateOptions;
    }

    const inputLower = input.toLowerCase();

    const startsWith = stateOptions.filter((opt) =>
      opt.label.toLowerCase().startsWith(inputLower),
    );

    const contains = stateOptions.filter(
      (opt) =>
        !opt.label.toLowerCase().startsWith(inputLower) &&
        opt.label.toLowerCase().includes(inputLower),
    );

    return [...startsWith, ...contains];
  };

  /* ======================================================= */
  /* SELECT STYLES                                             */
  /* ======================================================= */

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

    valueContainer: (provided: any) => ({
      ...provided,

      width: "100%",
      height: "100%",

      padding: "0",

      background: "transparent",
    }),

    input: (provided: any) => ({
      ...provided,

      margin: "0",
      padding: "0",

      color: "#38170B",
    }),

    singleValue: (provided: any) => ({
      ...provided,

      color: "#6C1700",
    }),

    placeholder: (provided: any) => ({
      ...provided,

      color: "#777",
    }),

    indicatorSeparator: () => ({
      display: "none",
    }),

    dropdownIndicator: (provided: any) => ({
      ...provided,

      color: "#38170B",
    }),

    menuPortal: (provided: any) => ({
      ...provided,

      zIndex: 9999,
    }),

    menu: (provided: any) => ({
      ...provided,

      marginTop: 4,
    }),

    menuList: (provided: any) => ({
      ...provided,

      maxHeight: isMobile ? 190 : 260,

      padding: 4,
    }),
  };

  const selectProps = {
    styles: customStyle,

    classNamePrefix: "regselect",

    menuPortalTarget: document.body,

    menuPlacement: "auto" as const,

    menuShouldScrollIntoView: !isMobile,

    blurInputOnSelect: isMobile,
  };

  /* ======================================================= */
  /* DOB                                                       */
  /* ======================================================= */

  const updateDob = (day: string, month: string, year: string) => {
    setDobDay(day);
    setDobMonth(month);
    setDobYear(year);

    // React Hook Form receives the final DOB only after
    // Day, Month and Year have all been selected.
    if (day && month && year) {
      setValue("dob", `${year}-${month}-${day}`, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      setValue("dob", "", {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  /* ======================================================= */
  /* SUBMIT                                                    */
  /* ======================================================= */

  const onSubmit = (data: FormData) => {
    const finalData = {
      ...data,
      email_id: userEmail,
    };

    setUserData(finalData);

    onClickNext();

    // NOTE: the draft is deliberately NOT cleared here. The user can still
    // come back from the Events screen, and clearing it now would empty the
    // form. Clear "registrationFormData" only after the final registration
    // request succeeds (in the confirm modal).
  };

  /* ======================================================= */
  /* UI                                                        */
  /* ======================================================= */

  return (
    <div
      className={styles.registerContainer}
      style={{
        backgroundImage: `url(${RegBg})`,
      }}
    >
      {/* BACKGROUND DECORATIONS */}

      <img src={leftbottom} className={styles.leftbottom} alt="Left Bottom" />

      <img src={lefttop} className={styles.lefttop} alt="Left Top" />
      <img src={leftmiddle} className={styles.leftmiddle} alt="Left Middle" />
      <img src={rightmid} className={styles.rightmid} alt="Right Middle" />

      <img src={rightbottom} className={styles.rightbottom} alt="" />

      <img src={righttop} className={styles.righttop} alt="Right Top" />

      <Link className={styles.backButton} to="/">
        <img src={backBtn} alt="Go back to Home Page" />
      </Link>

      {/* BOOK */}

      <div
        className={styles.bookContainer}
        style={{
          backgroundImage: `url(${book})`,
        }}
      >
        {/* TAJ MAHAL */}

        <img src={tajmahal} className={styles.tajmahal} alt="Taj Mahal" />

        <form
          className={styles.formContainer}
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="off"
        >
          {/* HEADING */}

          {isMobile && <h2 className={styles.regTitle}>Registration</h2>}

          <div className={styles.mobileContainer}>
            {/* ================================================= */}
            {/* LEFT PAGE                                         */}
            {/* ================================================= */}

            <div className={isMobile ? styles.formColumn : styles.formLeft}>
              {/* HEADING */}

              {!isMobile && <h2 className={styles.regTitle}>Registration</h2>}

              {/* NAME */}

              <Reginput title="Name" registration={register("name")} />

              {errors.name && (
                <p className={styles.error}>{errors.name.message}</p>
              )}

              {/* EMAIL */}

              <Reginput
                title="Email Id"
                registration={register("email_id")}
                disabled
                placeholder={userEmail}
              />

              {errors.email_id && (
                <p className={styles.error}>{errors.email_id.message}</p>
              )}

              {/* PHONE */}

              <Reginput
                title="Phone Number"
                registration={register("phone")}
                type="tel"
              />

              {errors.phone && (
                <p className={styles.error}>{errors.phone.message}</p>
              )}

              {/* GENDER */}

              <Reginput title="Gender" showLine={false}>
                <div className={styles.genderOptions}>
                  {genderOptions.map((option) => (
                    <label key={option.value} className={styles.genderOption}>
                      <input
                        type="radio"
                        value={option.value}
                        {...register("gender")}
                      />

                      <span className={styles.genderDiamond} />

                      <span className={styles.genderLabel}>{option.label}</span>
                    </label>
                  ))}
                </div>
              </Reginput>

              {errors.gender && (
                <p className={styles.error}>{errors.gender.message}</p>
              )}

              {/* DATE OF BIRTH */}

              <Reginput title="Date Of Birth" showLine={false}>
                <div className={styles.dobOptions}>
                  <select
                    value={dobDay}
                    onChange={(e) =>
                      updateDob(e.target.value, dobMonth, dobYear)
                    }
                    className={styles.dobSelect}
                  >
                    <option value="">Day</option>

                    {days.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>

                  <select
                    value={dobMonth}
                    onChange={(e) => updateDob(dobDay, e.target.value, dobYear)}
                    className={styles.dobSelect}
                  >
                    <option value="">Month</option>

                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={dobYear}
                    onChange={(e) =>
                      updateDob(dobDay, dobMonth, e.target.value)
                    }
                    className={styles.dobSelect}
                  >
                    <option value="">Year</option>

                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </Reginput>

              {errors.dob && (
                <p className={styles.error}>{errors.dob.message}</p>
              )}

              {/* COLLEGE */}

              <Reginput title="College" showLine>
                <Controller
                  name="college_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      {...selectProps}
                      options={collegeOptions}
                      placeholder="Select College"
                      menuPlacement="top"
                      value={
                        collegeOptions.find(
                          (college) => college.value === field.value,
                        ) || null
                      }
                      onChange={(option) => field.onChange(option?.value || "")}
                    />
                  )}
                />
              </Reginput>

              {errors.college_id && (
                <p className={styles.error}>{errors.college_id.message}</p>
              )}
            </div>

            {/* ================================================= */}
            {/* RIGHT PAGE                                        */}
            {/* ================================================= */}

            <div className={isMobile ? styles.formColumn : styles.formRight}>
              {/* YEAR */}

              <Reginput title="Year Of Study" showLine={false}>
                <div className={styles.yearOptions}>
                  {["1", "2", "3", "4"].map((year) => (
                    <label key={year} className={styles.yearOption}>
                      <input type="radio" value={year} {...register("year")} />

                      <span className={styles.yearDiamond} />

                      <span className={styles.yearLabel}>{year}</span>
                    </label>
                  ))}
                </div>
              </Reginput>

              {errors.year && (
                <p className={styles.error}>{errors.year.message}</p>
              )}

              {/* CITY */}

              {/* STATE */}

              <Reginput title="State" showLine>
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      {...selectProps}
                      options={getFilteredOptions(inputValue)}
                      placeholder="Select State"
                      value={
                        stateOptions.find(
                          (state) => state.value === field.value,
                        ) || null
                      }
                      onInputChange={(value) => setInputValue(value)}
                      filterOption={() => true}
                      onChange={(option) => {
                        const value = option?.value || "";

                        field.onChange(value);

                        setSelectedState(value);

                        setValue("city", "");
                      }}
                    />
                  )}
                />
              </Reginput>

              {errors.state && (
                <p className={styles.error}>{errors.state.message}</p>
              )}

              <Reginput title="City" showLine>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      {...selectProps}
                      options={availableCities}
                      placeholder="Select City"
                      isDisabled={!selectedState}
                      value={
                        availableCities.find(
                          (city) => city.value === field.value,
                        ) || null
                      }
                      onChange={(option) => field.onChange(option?.value || "")}
                    />
                  )}
                />
              </Reginput>

              {errors.city && (
                <p className={styles.error}>{errors.city.message}</p>
              )}

              {/* NEXT */}

              {!isMobile && <button
                type="submit"
                style={{
                  backgroundImage: `url(${buttonBg})`,
                }}
                className={styles.nextButton}
              >
                NEXT
              </button>}
            </div>
          </div>

          {isMobile && <button
            type="submit"
            style={{
              backgroundImage: `url(${buttonBg})`,
            }}
            className={styles.nextButton}
          >
            NEXT
          </button>}
        </form>
      </div>
    </div>
  );
}
