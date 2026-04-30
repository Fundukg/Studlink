-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_groupId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_groupId_fkey";

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
