const calculateUpcomingSunday = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  let daysUntilNextSunday = 7 - dayOfWeek;

  const upcomingSunday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + daysUntilNextSunday
  );

  return new Date(
    Date.UTC(
      upcomingSunday.getFullYear(),
      upcomingSunday.getMonth(),
      upcomingSunday.getDate()
    )
  );
};

module.exports = { calculateUpcomingSunday };
