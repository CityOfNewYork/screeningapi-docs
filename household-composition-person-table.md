### Person

| Name                                              | Description                                                                 | Data Attribute                 | Type and/or Value |
|---------------------------------------------------|-----------------------------------------------------------------------------|--------------------------------|-------------------|
| **Age**                                           | The age of the person.                                                      | `age`                          | **Integer** |
| **Student**                                       | Whether the person is a student or not.                                     | `student`                      | **Boolean** |
| **Full-time Student**                             | Whether the person is a full-time student or not.                           | `studentFulltime`              | **Boolean** |
| **Pregnant**                                      | Whether the person is pregnant or not.                                      | `pregnant`                     | **Boolean** |
| **Unemployed**                                    | Whether the person is employed or not.                                      | `unemployed`                   | **Boolean** |
| **Unemployed and Worked in the Last 18 Months**   | Whether the person is unemployed and worked within the last 18 months.      | `unemployedWorkedLast18Months` | **Boolean** |
| **Is Blind**                                      | Whether the person is blind or not.                                         | `blind`                        | **Boolean** |
| **Has any Disabilities**                          | Whether the person has disabilities or not.                                 | `disabled`                     | **Boolean** |
| **Veteran**                                       | Whether the person is a veteran or not.                                     | `veteran`                      | **Boolean** |
| **Receives Medicaid Benefits**                    | Whether the person receives Medicaid benefits or not.                       | `benefitsMedicaid`             | **Boolean** |
| **Receives Disability-related Medicaid Benefits** | Whether the person receives disability-related Medicaid benefits or not.    | `benefitsMedicaidDisability`   | **Boolean** |
| **Household Member Type**                         | What is this person's relation to the household?                            | `householdMemberType`          | **String** Blank ("") or one listed below. |
|                                                   | Head of Household                                                           |                                | *HeadOfHousehold* |
|                                                   | Child                                                                       |                                | *Child* |
|                                                   | Foster Child                                                                |                                | *FosterChild* |
|                                                   | Step-child                                                                  |                                | *StepChild* |
|                                                   | Grandchild                                                                  |                                | *Grandchild* |
|                                                   | Spouse                                                                      |                                | *Spouse* |
|                                                   | Parent                                                                      |                                | *Parent* |
|                                                   | Foster Parent                                                               |                                | *FosterParent* |
|                                                   | Step-parent                                                                 |                                | *StepParent* |
|                                                   | Grandparent                                                                 |                                | *Grandparent* |
|                                                   | Sister/Brother                                                              |                                | *SisterBrother* |
|                                                   | Step-sister/Step-brother                                                    |                                | *StepSisterStepBrother* |
|                                                   | Boyfriend/Girlfriend                                                        |                                | *BoyfriendGirlfriend* |
|                                                   | Domestic Partner                                                            |                                | *DomesticPartner* |
|                                                   | Unrelated                                                                   |                                | *Unrelated* |
|                                                   | Related in some other way                                                   |                                | *Other* |
| **Owner or on deed**                              | If the household owns the home is the person the owner or on the deed.     | `livingOwnerOnDeed`            | **Boolean** |
| **Renting and on the Rental Lease**               | If the household rental is renting, whether the person on the lease or not. | `livingRentalOnLease`          | **Boolean** |
| **Income**                                        | A collection of one or more income objects.                                 | `incomes`                      | **Array** of **Objects**. Each object containing one of `amount`, `type`, and `frequency`. |
|                                                   | **Income amount.** The dollar amount of the income.                         | `amount`                       | **Number** greater than or equal to 0. *Example: 200.00* |
|                                                   | **Income type.** The type of the income (see below).                        | `type`                         | **String** Blank ("") or one listed below. |
|                                                   | Wages, salaries, tips.                                                      |                                | *Wages* |
|                                                   | Self-employment income.                                                     |                                | *SelfEmployment* |
|                                                   | Unemployment benefits.                                                      |                                | *Unemployment* |
|                                                   | Cash Assistance grant.                                                      |                                | *CashAssistance* |
|                                                   | Child support (received).                                                   |                                | *ChildSupport* |
|                                                   | Disability-related Medicaid.                                                |                                | *DisabilityMedicaid* |
|                                                   | Supplemental Security Income (SSI).                                         |                                | *SSI* |
|                                                   | Social Security Dependent benefits.                                         |                                | *SSDependent* |
|                                                   | Social Security Disability benefits.                                        |                                | *SSDisability* |
|                                                   | Social Security Survivor’s benefits.                                        |                                | *SSSurvivor* |
|                                                   | Social Security Retirement benefits.                                        |                                | *SSRetirement* |
|                                                   | New York State Disability benefits.                                         |                                | *NYSDisability* |
|                                                   | Veteran’s Pension or benefits.                                              |                                | *Veteran* |
|                                                   | Government or Private Pension.                                              |                                | *Pension* |
|                                                   | Withdrawals from Deferred Compensation (IRA, Keogh, etc.).                  |                                | *DeferredComp* |
|                                                   | Worker’s Compensation.                                                      |                                | *WorkersComp* |
|                                                   | Alimony (received).                                                         |                                | *Alimony* |
|                                                   | Boarder or lodger.                                                          |                                | *Boarder* |
|                                                   | Gifts/contributions (received)                                              |                                | *Gifts* |
|                                                   | Rental income.                                                              |                                | *Rental* |
|                                                   | Investment income (interest, dividends, and profit from selling stocks).    |                                | *Investment* |
|                                                   | **Income frequency.** How often the income is received.                     | `frequency`                    | One of the strings below. |
|                                                   | Every week.                                                                 |                                | *Weekly* |
|                                                   | Every two weeks.                                                            |                                | *Biweekly* |
|                                                   | Monthly                                                                     |                                | *Monthly* |
|                                                   | Twice a month.                                                              |                                | *Semimonthly* |
|                                                   | Every year.                                                                 |                                | *Yearly* |
| **Expenses**                                      | A collection of one or more expense objects.                                | `expenses`                     | **Array** of **Objects**. Each object containing one of `amount`, `type`, and `frequency`. |
|                                                   | **Expense amount.** The dollar amount of the expense.                       | `amount`                       | Value greater than or equal to 0. | **Number** greater than or equal to 0. *Example: 2000.00* |
|                                                   | **Expense type.** The type of the expense (see below).                      | `type`                         | **String** Blank ("") or one listed below. |
|                                                   | Child care.                                                                 |                                | *ChildCare* |
|                                                   | Child Support (paid).                                                       |                                | *ChildSupport* |
|                                                   | Dependent Care.                                                             |                                | *DependentCare* |
|                                                   | Rent                                                                        |                                | *Rent* |
|                                                   | Medical expense                                                             |                                | *Medical* |
|                                                   | Heating                                                                     |                                | *Heating* |
|                                                   | Cooling                                                                     |                                | *Cooling* |
|                                                   | Mortgage                                                                    |                                | *Mortgage* |
|                                                   | Utilities                                                                   |                                | *Utilities* |
|                                                   | Telephone                                                                   |                                | *Telephone* |
|                                                   | Third party insurance premiums.                                             |                                | *InsurancePremiums* |
|                                                   | **Expense frequency.** How often the expense is paid (see below).           | `frequency`                    | **String** Blank ("") or one listed below. |
|                                                   | Every week.                                                                 |                                | *Weekly* |
|                                                   | Every two weeks.                                                            |                                | *Biweekly* |
|                                                   | Monthly                                                                     |                                | *Monthly* |
|                                                   | Twice a month.                                                              |                                | *Semimonthly* |
|                                                   | Every year.                                                                 |                                | *Yearly* |
