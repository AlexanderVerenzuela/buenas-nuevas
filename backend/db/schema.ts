import { pgTable, text, timestamp, boolean, unique, primaryKey } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { randomUUID } from "crypto"

// Enums
export const roleEnum = ['ADMIN', 'LEADER', 'VIEWER'] as const;
export const youthStatusEnum = ['VISITOR', 'NEW', 'MEMBER', 'LEADER', 'INACTIVE', 'COMMISSION', 'PREACHING', 'FAMILY'] as const;
export const discipleshipStatusEnum = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'] as const;
export const meetingTypeEnum = ['GENERAL', 'DISCIPLESHIP', 'CELL_GROUP', 'SPECIAL_EVENT', 'CAMP', 'CINE', 'SALIDA_EVANGELISTICA', 'OTRO'] as const;
export const meetingStatusEnum = ['SCHEDULED', 'COMPLETED', 'CANCELLED'] as const;
export const attendanceStatusEnum = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'VISITOR'] as const;

// Helper for UUID (formerly CUID)
const cuid = () => randomUUID();

// Tables
export const users = pgTable('User', {
  id: text('id').primaryKey().$defaultFn(cuid),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  name: text('name'),
  role: text('role', { enum: roleEnum }).default('VIEWER').notNull(),
  isActive: boolean('isActive').default(true).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const leaders = pgTable('Leader', {
  id: text('id').primaryKey().$defaultFn(cuid),
  firstName: text('firstName').notNull(),
  lastName: text('lastName').notNull(),
  phone: text('phone'),
  email: text('email'),
  gender: text('gender'),
  birthDate: timestamp('birthDate', { mode: 'date' }),
  isActive: boolean('isActive').default(true).notNull(),
  observations: text('observations'),
  userId: text('userId').unique().references(() => users.id, { onDelete: 'set null' }),
  youthId: text('youthId').unique(), // references youth.id handled in relations or manually below
  createdAt: timestamp('createdAt', { mode: 'date' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
});

export const youths = pgTable('Youth', {
  id: text('id').primaryKey().$defaultFn(cuid),
  firstName: text('firstName').notNull(),
  lastName: text('lastName').notNull(),
  gender: text('gender'),
  birthDate: timestamp('birthDate', { mode: 'date' }),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  email: text('email'),
  address: text('address'),
  avatarUrl: text('avatarUrl'),
  status: text('status', { enum: youthStatusEnum }).default('VISITOR').notNull(),
  firstContactDate: timestamp('firstContactDate', { mode: 'date' }).$defaultFn(() => new Date()),
  joinDate: timestamp('joinDate', { mode: 'date' }),
  campus: text('campus'),
  observations: text('observations'),
  isStudying: boolean('isStudying').default(false).notNull(),
  career: text('career'),
  studyCenter: text('studyCenter'),
  studyCycle: text('studyCycle'),
  isWorking: boolean('isWorking').default(false).notNull(),
  workplace: text('workplace'),
  occupation: text('occupation'),
  isConverted: boolean('isConverted'),
  conversionDate: timestamp('conversionDate', { mode: 'date' }),
  isBaptized: boolean('isBaptized'),
  baptismDate: timestamp('baptismDate', { mode: 'date' }),
  discipleship: text('discipleship', { enum: discipleshipStatusEnum }).default('NOT_STARTED').notNull(),
  servesInMinistry: boolean('servesInMinistry').default(false).notNull(),
  isActive: boolean('isActive').default(true).notNull(),
  leaderId: text('leaderId').references(() => leaders.id, { onDelete: 'set null' }),
  groupId: text('groupId'), // references DiscipleshipGroup
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow(),
});

export const discipleshipGroups = pgTable('DiscipleshipGroup', {
  id: text('id').primaryKey().$defaultFn(cuid),
  name: text('name').notNull(),
  description: text('description'),
  meetingDay: text('meetingDay'),
  meetingTime: text('meetingTime'),
  location: text('location'),
  isActive: boolean('isActive').default(true).notNull(),
  leaderId: text('leaderId').unique().notNull().references(() => leaders.id),
  coLeaderId: text('coLeaderId'),
  coLeaderName: text('coLeaderName'),
  createdAt: timestamp('createdAt', { mode: 'date' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
});

export const meetings = pgTable('Meeting', {
  id: text('id').primaryKey().$defaultFn(cuid),
  title: text('title').notNull(),
  type: text('type', { enum: meetingTypeEnum }).notNull(),
  date: timestamp('date', { mode: 'date' }).notNull(),
  time: text('time'),
  location: text('location'),
  description: text('description'),
  photoUrl: text('photoUrl'),
  status: text('status', { enum: meetingStatusEnum }).default('SCHEDULED').notNull(),
  leaderId: text('leaderId').references(() => leaders.id, { onDelete: 'set null' }),
  preacher: text('preacher'),
  preachingTheme: text('preachingTheme'),
  subType: text('subType'),
  meetingNotes: text('meetingNotes'),
  createdAt: timestamp('createdAt', { mode: 'date' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
});

export const attendances = pgTable('Attendance', {
  id: text('id').primaryKey().$defaultFn(cuid),
  status: text('status', { enum: attendanceStatusEnum }).notNull(),
  observations: text('observations'),
  youthId: text('youthId').notNull().references(() => youths.id, { onDelete: 'cascade' }),
  meetingId: text('meetingId').notNull().references(() => meetings.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  unq: unique('Attendance_youthId_meetingId_key').on(table.youthId, table.meetingId)
}));

export const ministries = pgTable('Ministry', {
  id: text('id').primaryKey().$defaultFn(cuid),
  name: text('name').unique().notNull(),
  description: text('description'),
  isActive: boolean('isActive').default(true).notNull(),
});

export const youthMinistries = pgTable('YouthMinistry', {
  youthId: text('youthId').notNull().references(() => youths.id, { onDelete: 'cascade' }),
  ministryId: text('ministryId').notNull().references(() => ministries.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joinedAt', { mode: 'date' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.youthId, table.ministryId] })
}));

// Relations
export const youthRelations = relations(youths, ({ one, many }) => ({
  leader: one(leaders, { fields: [youths.leaderId], references: [leaders.id] }),
  group: one(discipleshipGroups, { fields: [youths.groupId], references: [discipleshipGroups.id] }),
  attendances: many(attendances),
  ministries: many(youthMinistries),
}));

export const leaderRelations = relations(leaders, ({ one, many }) => ({
  user: one(users, { fields: [leaders.userId], references: [users.id] }),
  assignedYouth: many(youths),
  discipleshipGroup: one(discipleshipGroups),
  meetingsLed: many(meetings),
}));

export const discipleshipGroupRelations = relations(discipleshipGroups, ({ one, many }) => ({
  leader: one(leaders, { fields: [discipleshipGroups.leaderId], references: [leaders.id] }),
  members: many(youths),
}));

export const meetingRelations = relations(meetings, ({ one, many }) => ({
  leader: one(leaders, { fields: [meetings.leaderId], references: [leaders.id] }),
  attendances: many(attendances),
}));

export const attendanceRelations = relations(attendances, ({ one }) => ({
  youth: one(youths, { fields: [attendances.youthId], references: [youths.id] }),
  meeting: one(meetings, { fields: [attendances.meetingId], references: [meetings.id] }),
}));

export const ministryRelations = relations(ministries, ({ many }) => ({
  youth: many(youthMinistries),
}));

export const youthMinistryRelations = relations(youthMinistries, ({ one }) => ({
  youth: one(youths, { fields: [youthMinistries.youthId], references: [youths.id] }),
  ministry: one(ministries, { fields: [youthMinistries.ministryId], references: [ministries.id] }),
}));
