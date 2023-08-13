name := "tinderific"

version := "1.0-SNAPSHOT"

libraryDependencies ++= Seq(
  jdbc,
  anorm,
  cache
)

libraryDependencies += "net.sourceforge.htmlunit" % "htmlunit" % "2.33"

play.Project.playScalaSettings
