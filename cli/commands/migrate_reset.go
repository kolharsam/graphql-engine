package commands

import (
	"fmt"
	"io/ioutil"
	"os"

	"github.com/hasura/graphql-engine/cli"
	"github.com/hasura/graphql-engine/cli/migrate"
	"github.com/pkg/errors"
	"github.com/spf13/cobra"
)

func newMigrateResetCommand(ec *cli.ExecutionContext) *cobra.Command {
	opts := &migrateResetOptions{
		EC: ec,
	}
	migrateResetCmd := &cobra.Command{
		Use:   "reset",
		Short: "Clear migration history",
		Example: `
			# to clear all migrations until the current state
			hasura migrate reset
		`,
		SilenceUsage: true,
		PreRunE: func(cmd *cobra.Command, args []string) error {
			return ec.Prepare()
		},
		RunE: func(cmd *cobra.Command, args []string) error {
			return opts.run()
		},
	}

	return migrateResetCmd
}

type migrateResetOptions struct {
	EC *cli.ExecutionContext
}

func (o *migrateResetOptions) run() error {
	o.EC.Logger.Info("Clearing your migrations...")

	// Step 1 - delete the contents of migration Dir
	migrDirFiles, err := ioutil.ReadDir(ec.MigrationDir)
	if err != nil {
		return errors.Wrap(err, "could not locate migrations directory")
	}
	if len(migrDirFiles) == 0 {
		// TODO: check if this is necessary, maybe we could provide a flag and it would run the sql migration alone
		o.EC.Logger.Debug("nothing to delete, the migrations folder is empty")
		return nil
	}
	err = os.RemoveAll(ec.MigrationDir)
	if err != nil {
		return errors.Wrap(err, fmt.Sprintf("could not delete migration folder at %s", ec.MigrationDir))
	}
	err = os.MkdirAll(ec.MigrationDir, os.ModePerm)
	if err != nil {
		return errors.Wrap(err, "cannot create migrations directory")
	}

	// Step 2 - to truncate all entries in the database
	migr, err := migrate.NewMigrate(ec, false)
	if err != nil {
		return errors.Wrap(err, "failed to create truncate migration")
	}

	err = migr.TruncateDBMigrationsTable()
	if err != nil {
		return errors.Wrap(err, "failed to make sql request to the server")
	}

	return nil
}
